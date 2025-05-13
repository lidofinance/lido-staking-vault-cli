import { program } from 'command';
import { Option } from 'commander';

import {
  getBLSHarnessContract,
  getStakingVaultContract,
  getCLProofVerifierContract,
  getPredepositGuaranteeContract,
} from 'contracts';
import { Deposit } from 'types';
import {
  createPDGProof,
  getFirstValidatorGIndex,
  confirmMakeProof,
  showSpinner,
  printError,
  computeDepositDataRoot,
  logResult,
  logInfo,
  getCommandsJson,
  computeDepositDomainByForkVersion,
  toHex,
  parseDepositArray,
  logError,
  callReadMethod,
  isValidBLSDeposit,
  expandBLSSignature,
  logTable,
} from 'utils';
import { Address, Hex } from 'viem';

const predepositGuaranteeHelpers = program
  .command('pdg-helpers')
  .description('predeposit guarantee helpers');

predepositGuaranteeHelpers.addOption(new Option('-cmd2json'));
predepositGuaranteeHelpers.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(predepositGuaranteeHelpers));
  process.exit();
});

predepositGuaranteeHelpers
  .command('proof-and-check')
  .aliases(['proof-check'])
  .option('-i, --index <index>', 'validator index')
  .description(
    'make predeposit proof by validator index and check by test contract',
  )
  .action(async ({ index }: { index: bigint }) => {
    const validatorIndex = await confirmMakeProof(index);
    if (!validatorIndex) return;

    const clProofVerifierContract = getCLProofVerifierContract();

    const hideSpinner = showSpinner();
    try {
      const packageProof = await createPDGProof(Number(validatorIndex));
      hideSpinner();
      const { proof, pubkey, childBlockTimestamp, withdrawalCredentials } =
        packageProof;

      await clProofVerifierContract.read.TEST_validatePubKeyWCProof([
        { proof, pubkey, validatorIndex, childBlockTimestamp },
        withdrawalCredentials,
      ]);

      logResult({});
      logInfo('-----------------proof verified-----------------');
      logInfo('------------------------------------------------');
      logInfo('----------------------proof----------------------');
      logInfo(proof);
      logTable({
        data: [
          ['Pubkey', pubkey],
          ['Child Block Timestamp', childBlockTimestamp],
          ['Withdrawal Credentials', withdrawalCredentials],
        ],
      });
      logInfo('-----------------------end-----------------------');
      hideSpinner();
    } catch (err) {
      hideSpinner();
      printError(err, 'Error when making proof');
    }
  });

predepositGuaranteeHelpers
  .command('proof')
  .description('make predeposit proof by validator index')
  .option('-i, --index <index>', 'validator index')
  .action(async ({ index }: { index: bigint }) => {
    const validatorIndex = await confirmMakeProof(index);
    if (!validatorIndex) return;

    const hideSpinner = showSpinner();
    try {
      const packageProof = await createPDGProof(Number(validatorIndex));
      const { proof, pubkey, childBlockTimestamp, withdrawalCredentials } =
        packageProof;

      logResult({});
      logInfo('----------------------proof----------------------');
      logInfo(proof);
      logTable({
        data: [
          ['Pubkey', pubkey],
          ['Child Block Timestamp', childBlockTimestamp],
          ['Withdrawal Credentials', withdrawalCredentials],
        ],
      });
      logInfo('-----------------------end-----------------------');
      hideSpinner();
    } catch (err) {
      hideSpinner();
      printError(err, 'Error when making proof');
    }
  });

predepositGuaranteeHelpers
  .command('verify-predeposit-bls')
  .aliases(['verify-bls'])
  .description('Verifies BLS signature of the deposit')
  .option('-a, --vault <address>', 'vault address')
  .option('-w, --withdrawalCredentials <hex>', 'withdrawal credentials')
  .argument('<deposits>', 'deposits', parseDepositArray)
  .addHelpText(
    'after',
    `Deposit format:
    '[{
      "pubkey": "...",
      "signature": "...",
      "amount": "...",
      "deposit_data_root": "..."
    }
    {second deposit}
    ...]'`,
  )
  .action(
    async (
      deposits: Deposit[],
      options: { vault: Address; withdrawalCredentials: Hex },
    ) => {
      const vault = options.vault;
      let withdrawalCredentials = options.withdrawalCredentials;

      if (!vault && !withdrawalCredentials) {
        logError('You must provide either vault or withdrawal credentials');
        return;
      } else if (vault && withdrawalCredentials) {
        logError('You can only provide one of vault or withdrawal credentials');
        return;
      }
      const bls = getBLSHarnessContract();
      const hideMetadataSpinner = showSpinner({
        type: 'bouncingBar',
        message: 'Loading metadata...',
      });
      const pdg = await getPredepositGuaranteeContract();
      const PREDEPOSIT_AMOUNT = await callReadMethod(pdg, 'PREDEPOSIT_AMOUNT');

      if (vault) {
        const vaultContract = getStakingVaultContract(vault);
        const wc = await callReadMethod(vaultContract, 'withdrawalCredentials');
        withdrawalCredentials = wc;
      }
      hideMetadataSpinner();

      for (const deposit of deposits) {
        // amount check
        if (deposit.amount !== PREDEPOSIT_AMOUNT) {
          logError(
            `❌ Deposit amount is not equal to PREDEPOSIT_AMOUNT for pubkey ${deposit.pubkey}`,
          );
          return;
        } else {
          logInfo(`✅ AMOUNT VALID for Pubkey ${deposit.pubkey}`);
        }

        // depositDataRoot check
        const depositDataRoot = computeDepositDataRoot(
          deposit.pubkey,
          withdrawalCredentials,
          deposit.signature,
          deposit.amount,
        );
        if (depositDataRoot != deposit.depositDataRoot) {
          logError(
            `❌ depositDataRoot does not match ${deposit.pubkey}, actual root: ${depositDataRoot}`,
          );
          return;
        } else {
          logInfo(`✅ depositDataRoot VALID for Pubkey ${deposit.pubkey}`);
        }

        // local BLS check
        const isBLSValid = isValidBLSDeposit(deposit, withdrawalCredentials);
        if (!isBLSValid) {
          logError(
            `❌ Offchain - BLS signature is not valid for Pubkey ${deposit.pubkey}`,
          );
          return;
        } else {
          logInfo(`✅ SIGNATURE VALID for Pubkey ${deposit.pubkey}`);
        }

        // onchain BLS check
        const {
          pubkeyY_a,
          pubkeyY_b,
          sigY_c0_a,
          sigY_c0_b,
          sigY_c1_a,
          sigY_c1_b,
        } = expandBLSSignature(deposit.signature, deposit.pubkey);
        const hideSpinner = showSpinner({
          type: 'bouncingBar',
          message: 'Checking onchain againts BLSHarness contract',
        });
        try {
          await bls.read.verifyDepositMessage([
            deposit,
            {
              pubkeyY: { a: pubkeyY_a, b: pubkeyY_b },
              signatureY: {
                c0_a: sigY_c0_a,
                c0_b: sigY_c0_b,
                c1_a: sigY_c1_a,
                c1_b: sigY_c1_b,
              },
            },
            withdrawalCredentials,
          ]);

          hideSpinner();
          logInfo(`✅ ONCHAIN 🔗 SIGNATURE VALID for Pubkey ${deposit.pubkey}`);
        } catch (err) {
          hideSpinner();
          logError(
            `❌ Onchain - BLS signature is not valid for Pubkey ${deposit.pubkey}`,
          );
          logError(err);
        }
      }
    },
  );

predepositGuaranteeHelpers
  .command('fv-gindex')
  .argument('<forks...>', 'fork name')
  .description('get first validator gindex')
  .action(async (forks: string[]) => {
    getFirstValidatorGIndex(forks);
  });

predepositGuaranteeHelpers
  .command('compute-deposit-data-root')
  .aliases(['compute-dd-root'])
  .description('compute deposit data root')
  .argument('<pubkey>', 'pubkey')
  .argument('<withdrawal-credentials>', 'withdrawal credentials')
  .argument('<signature>', 'signature')
  .argument('<amount>', 'amount in ETH')
  .action(
    async (
      pubkey: string,
      withdrawalCredentials: string,
      signature: string,
      amount: string,
    ) => {
      const result = computeDepositDataRoot(
        pubkey,
        withdrawalCredentials,
        signature,
        amount,
      );

      logResult({
        data: [
          ['Pubkey', pubkey],
          ['Withdrawal Credentials', withdrawalCredentials],
          ['Signature', signature],
          ['Amount', amount],
          ['Deposit Data Root', result],
        ],
      });
    },
  );

predepositGuaranteeHelpers
  .command('compute-deposit-domain')
  .aliases(['compute-d-domain'])
  .description('compute deposit domain')
  .argument('<forkVersion>', 'fork version')
  .action(async (forkVersion: string) => {
    const result = computeDepositDomainByForkVersion(forkVersion);

    logResult({
      data: [
        ['Fork Version', forkVersion],
        ['Deposit Domain', toHex(result)],
      ],
    });
  });

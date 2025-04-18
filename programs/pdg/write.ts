import { Address, Hex } from 'viem';

import {
  getPredepositGuaranteeContract,
  getStakingVaultContract,
} from 'contracts';
import {
  callWriteMethodWithReceipt,
  createPDGProof,
  showSpinner,
  printError,
  parseDepositArray,
  stringToBigInt,
  stringToBigIntArray,
  etherToWei,
  Deposit,
  callReadMethod,
  computeDepositDataRoot,
  logResult,
  logInfo,
  logError,
  confirmOperation,
  confirmMakeProof,
} from 'utils';

import { pdg } from './main.js';
import { getBLSHarnessContract } from 'contracts/blsHarness.js';
import { isValidBLSDeposit, expandBLSSignature } from 'utils/bls.js';
import { getAccount } from 'providers';

pdg
  .command('predeposit')
  .description('predeposit')
  .argument('<vault>', 'vault address')
  .argument('<deposits>', 'deposits', parseDepositArray)
  .action(async (vault: Address, deposits: Deposit[]) => {
    const pdgContract = await getPredepositGuaranteeContract();

    const confirm = await confirmOperation(
      `Are you sure you want to predeposit ${deposits.length} deposits to the vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(pdgContract, 'predeposit', [
      vault,
      deposits,
    ]);
  });

pdg
  .command('verify-predeposit-bls')
  .aliases(['verify-bls'])
  .description('Verifies BLS signature of the deposit')
  .option('-vt, --vault <address>', 'vault address')
  .option('-wc, --withdrawalCredentials <hex>', 'withdrawal credentials')
  .argument('<deposits>', 'deposits', parseDepositArray)
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
        const isValid = await bls.read
          .verifyDepositMessage([
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
          ])
          .then(
            () => true,
            () => false,
          );
        hideSpinner();
        if (!isValid) {
          logError(
            `❌ Onchain - BLS signature is not valid for Pubkey ${deposit.pubkey}`,
          );
        } else {
          logInfo(`✅ ONCHAIN 🔗 SIGNATURE VALID for Pubkey ${deposit.pubkey}`);
        }
      }
    },
  );

pdg
  .command('proof-and-prove')
  .aliases(['prove'])
  .description('make proof and prove')
  .argument('<index>', 'validator index', stringToBigInt)
  .action(async (index: bigint) => {
    const pdgContract = await getPredepositGuaranteeContract();

    const validatorIndex = await confirmMakeProof(index);
    if (!validatorIndex) return;

    const hideSpinner = showSpinner({
      type: 'bouncingBar',
      message: 'Making proof...',
    });
    try {
      const packageProof = await createPDGProof(Number(validatorIndex));
      hideSpinner();
      const { proof, pubkey, childBlockTimestamp, withdrawalCredentials } =
        packageProof;

      logInfo('----------------------proof----------------------');
      logInfo(proof);
      logInfo('---------------------pubkey---------------------');
      logResult(pubkey);
      logInfo('---------------childBlockTimestamp---------------');
      logResult(childBlockTimestamp);
      logInfo('--------------withdrawalCredentials--------------');
      logResult(withdrawalCredentials);
      logInfo('------------------------------------------------');
      logInfo('-----------------------end-----------------------');

      await callWriteMethodWithReceipt(pdgContract, 'proveValidatorWC', [
        { proof, pubkey, validatorIndex, childBlockTimestamp },
      ]);
    } catch (err) {
      hideSpinner();
      printError(err, 'Error when making proof');
    }
  });

pdg
  .command('prove-and-deposit')
  .description('prove and deposit')
  .argument('<indexes>', 'validator indexes', stringToBigIntArray)
  .argument('<vault>', 'vault address')
  .argument('<deposits>', 'deposits', parseDepositArray)
  .action(async (indexes: bigint[], vault: Address, deposits: Deposit[]) => {
    const pdgContract = await getPredepositGuaranteeContract();

    const witnesses: {
      proof: Hex[];
      pubkey: Hex;
      validatorIndex: bigint;
      childBlockTimestamp: bigint;
    }[] = [];

    for (const index of indexes) {
      const validatorIndex = await confirmMakeProof(index);
      if (!validatorIndex) return;

      const hideSpinner = showSpinner({
        type: 'bouncingBar',
        message: 'Making proof...',
      });
      try {
        const packageProof = await createPDGProof(Number(validatorIndex));
        hideSpinner();
        const { proof, pubkey, childBlockTimestamp, withdrawalCredentials } =
          packageProof;

        witnesses.push({
          proof,
          pubkey,
          validatorIndex,
          childBlockTimestamp,
        });

        logInfo('----------------------proof----------------------');
        logInfo(proof);
        logInfo('---------------------pubkey---------------------');
        logResult(pubkey);
        logInfo('---------------childBlockTimestamp---------------');
        logResult(childBlockTimestamp);
        logInfo('--------------withdrawalCredentials--------------');
        logResult(withdrawalCredentials);
        logInfo('------------------------------------------------');
        logInfo('-----------------------end-----------------------');
      } catch (err) {
        hideSpinner();
        printError(err, 'Error when making proof');
      }
    }

    await callWriteMethodWithReceipt(pdgContract, 'proveAndDeposit', [
      witnesses,
      deposits,
      vault,
    ]);
  });

pdg
  .command('deposit-to-beacon-chain')
  .description('deposit to beacon chain')
  .argument('<vault>', 'vault address')
  .argument('<deposits>', 'deposits', parseDepositArray)
  .action(async (vault: Address, deposits: Deposit[]) => {
    const pdgContract = await getPredepositGuaranteeContract();

    await callWriteMethodWithReceipt(pdgContract, 'depositToBeaconChain', [
      vault,
      deposits,
    ]);
  });

pdg
  .command('top-up')
  .description('top up no balance')
  .argument('<nodeOperator>', 'node operator address')
  .argument('<amount>', 'amount in ETH', etherToWei)
  .action(async (nodeOperator: Address, amount: bigint) => {
    const pdgContract = await getPredepositGuaranteeContract();

    const confirm = await confirmOperation(
      `Are you sure you want to top up the node operator ${nodeOperator} with ${amount} ETH?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(
      pdgContract,
      'topUpNodeOperatorBalance',
      [nodeOperator],
      amount,
    );
  });

pdg
  .command('prove-unknown-validator')
  .description('prove unknown validator')
  .argument('<index>', 'validator index', stringToBigInt)
  .argument('<vault>', 'vault address')
  .action(async (index: bigint, vault: Address) => {
    const pdgContract = await getPredepositGuaranteeContract();

    const validatorIndex = await confirmMakeProof(index);
    if (!validatorIndex) return;

    const hideSpinner = showSpinner({
      type: 'bouncingBar',
      message: 'Making proof...',
    });
    try {
      const packageProof = await createPDGProof(Number(validatorIndex));
      hideSpinner();

      const { proof, pubkey, childBlockTimestamp, withdrawalCredentials } =
        packageProof;

      logInfo('----------------------proof----------------------');
      logInfo(proof);
      logInfo('---------------------pubkey---------------------');
      logResult(pubkey);
      logInfo('---------------childBlockTimestamp---------------');
      logResult(childBlockTimestamp);
      logInfo('--------------withdrawalCredentials--------------');
      logResult(withdrawalCredentials);
      logInfo('------------------------------------------------');
      logInfo('-----------------------end-----------------------');

      await callWriteMethodWithReceipt(pdgContract, 'proveUnknownValidator', [
        { proof, pubkey, validatorIndex, childBlockTimestamp },
        vault,
      ]);
    } catch (err) {
      hideSpinner();
      printError(err, 'Error when proving unknown validator');
    }
  });

pdg
  .command('prove-invalid-validator-wc')
  .description('prove invalid validator withdrawal credentials')
  .argument('<index>', 'validator index', stringToBigInt)
  .argument('<invalidWithdrawalCredentials>', 'invalid withdrawal credentials')
  .action(async (index: bigint, invalidWithdrawalCredentials: Hex) => {
    const pdgContract = await getPredepositGuaranteeContract();

    const validatorIndex = await confirmMakeProof(index);
    if (!validatorIndex) return;

    const hideSpinner = showSpinner({
      type: 'bouncingBar',
      message: 'Making proof...',
    });

    try {
      const packageProof = await createPDGProof(Number(validatorIndex));
      hideSpinner();
      const { proof, pubkey, childBlockTimestamp, withdrawalCredentials } =
        packageProof;

      logInfo('----------------------proof----------------------');
      logInfo(proof);
      logInfo('---------------------pubkey---------------------');
      logResult(pubkey);
      logInfo('---------------childBlockTimestamp---------------');
      logResult(childBlockTimestamp);
      logInfo('--------------withdrawalCredentials--------------');
      logResult(withdrawalCredentials);
      logInfo('------------------------------------------------');
      logInfo('invalid withdrawal credentials');
      logResult(invalidWithdrawalCredentials);
      logInfo('-----------------------end-----------------------');

      if (withdrawalCredentials !== invalidWithdrawalCredentials) {
        logInfo('withdrawal credentials are valid. Operation cancelled');
        return;
      }

      await callWriteMethodWithReceipt(pdgContract, 'proveInvalidValidatorWC', [
        { proof, pubkey, validatorIndex, childBlockTimestamp },
        invalidWithdrawalCredentials,
      ]);
    } catch (err) {
      hideSpinner();
      printError(err, 'Error when making proof');
    }
  });

pdg
  .command('withdraw-no-balance')
  .description('withdraw node operator balance')
  .argument('<nodeOperator>', 'node operator address')
  .argument('<amount>', 'amount in ETH', etherToWei)
  .argument('<recipient>', 'recipient address')
  .action(async (nodeOperator: Address, amount: bigint, recipient: Address) => {
    const pdgContract = await getPredepositGuaranteeContract();

    const confirm = await confirmOperation(
      `Are you sure you want to withdraw the node operator ${nodeOperator} balance ${amount} ETH to ${recipient}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(
      pdgContract,
      'withdrawNodeOperatorBalance',
      [nodeOperator, amount, recipient],
    );
  });

pdg
  .command('set-no-guarantor')
  .aliases(['set-no-g'])
  .description('set node operator guarantor')
  .argument('<guarantor>', 'new guarantor address')
  .action(async (guarantor: Address) => {
    const pdgContract = await getPredepositGuaranteeContract();
    const account = getAccount();

    const confirm = await confirmOperation(
      `Are you sure you want to set the node operator (${account.address}) guarantor to ${guarantor}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(pdgContract, 'setNodeOperatorGuarantor', [
      guarantor,
    ]);
  });

pdg
  .command('claim-guarantor-refund')
  .aliases(['claim-g-refund'])
  .description('claim guarantor refund')
  .argument('<recipient>', 'recipient address')
  .action(async (recipient: Address) => {
    const pdgContract = await getPredepositGuaranteeContract();

    await callWriteMethodWithReceipt(pdgContract, 'claimGuarantorRefund', [
      recipient,
    ]);
  });

pdg
  .command('compensate-disproven-predeposit')
  .aliases(['compensate'])
  .description('compensate disproven predeposit')
  .argument('<pubkey>', 'validator pubkey')
  .argument('<recipient>', 'recipient address')
  .action(async (pubkey: Hex, recipient: Address) => {
    const pdgContract = await getPredepositGuaranteeContract();

    const confirm = await confirmOperation(
      `Are you sure you want to compensate the disproven predeposit for validator ${pubkey} to ${recipient}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(
      pdgContract,
      'compensateDisprovenPredeposit',
      [pubkey, recipient],
    );
  });

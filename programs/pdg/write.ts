import { Address, formatEther, Hex } from 'viem';
import { Option } from 'commander';

import { getAccount } from 'providers';
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
  callReadMethod,
  logResult,
  logInfo,
  confirmOperation,
  confirmMakeProof,
  getCommandsJson,
  isValidBLSDeposit,
  expandBLSSignature,
} from 'utils';
import { Deposit } from 'types';

import { pdg } from './main.js';

const pdgWrite = pdg
  .command('write')
  .aliases(['w'])
  .description('pdg write commands');

pdgWrite.addOption(new Option('-cmd2json'));
pdgWrite.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(pdgWrite));
  process.exit();
});

pdgWrite
  .command('predeposit')
  .description('predeposit')
  .argument('<vault>', 'vault address')
  .argument('<deposits>', 'deposits', parseDepositArray)
  .option('--no-bls-check', 'skip bls signature check')
  .addHelpText(
    'after',
    `Deposit format:
    '{
      "pubkey": "...",
      "signature": "...",
      "amount": "...",
      "deposit_data_root": "..."
    }
    {second deposit}
    ...'`,
  )
  .action(
    async (
      vault: Address,
      deposits: Deposit[],
      options: { blsCheck: boolean },
    ) => {
      const pdgContract = await getPredepositGuaranteeContract();

      if (options.blsCheck) {
        const PREDEPOSIT_AMOUNT = await callReadMethod(
          pdgContract,
          'PREDEPOSIT_AMOUNT',
        );
        const vaultContract = getStakingVaultContract(vault);
        const withdrawalCredentials = await callReadMethod(
          vaultContract,
          'withdrawalCredentials',
        );

        for (const deposit of deposits) {
          const isBLSValid = isValidBLSDeposit(deposit, withdrawalCredentials);

          if (deposit.amount !== PREDEPOSIT_AMOUNT) {
            console.info(
              `❌ Deposit amount is not equal to PREDEPOSIT_AMOUNT for pubkey ${deposit.pubkey}`,
            );
          }
          if (!isBLSValid) {
            console.info(
              `❌ Offchain - BLS signature is not valid for Pubkey ${deposit.pubkey}`,
            );
          }
        }
      }

      const depositsY = deposits.map((deposit) => {
        const expanded = expandBLSSignature(deposit.signature, deposit.pubkey);
        return {
          pubkeyY: { a: expanded.pubkeyY_a, b: expanded.pubkeyY_b },
          signatureY: {
            c0_a: expanded.sigY_c0_a,
            c0_b: expanded.sigY_c0_b,
            c1_a: expanded.sigY_c1_a,
            c1_b: expanded.sigY_c1_b,
          },
        };
      });

      const confirm = await confirmOperation(
        `Are you sure you want to predeposit ${deposits.length} deposits to the vault ${vault}?
        Pubkeys: ${deposits.map((i) => i.pubkey).join(', ')}`,
      );
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract: pdgContract,
        methodName: 'predeposit',
        payload: [vault, deposits, depositsY],
      });
    },
  );

pdgWrite
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

      await callWriteMethodWithReceipt({
        contract: pdgContract,
        methodName: 'proveValidatorWC',
        payload: [{ proof, pubkey, validatorIndex, childBlockTimestamp }],
      });
    } catch (err) {
      hideSpinner();
      printError(err, 'Error when making proof');
    }
  });

pdgWrite
  .command('prove-and-deposit')
  .description('prove and deposit')
  .argument('<indexes>', 'validator indexes', stringToBigIntArray)
  .argument('<vault>', 'vault address')
  .argument('<deposits>', 'deposits', parseDepositArray)
  .addHelpText(
    'after',
    `Deposit format:
    '{
      "pubkey": "...",
      "signature": "...",
      "amount": "...",
      "deposit_data_root": "..."
    }
    {second deposit}
    ...'`,
  )
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

    await callWriteMethodWithReceipt({
      contract: pdgContract,
      methodName: 'proveAndDeposit',
      payload: [witnesses, deposits, vault],
    });
  });

pdgWrite
  .command('deposit-to-beacon-chain')
  .description('deposit to beacon chain')
  .argument('<vault>', 'vault address')
  .argument('<deposits>', 'deposits', parseDepositArray)
  .addHelpText(
    'after',
    `Deposit format:
    '{
      "pubkey": "...",
      "signature": "...",
      "amount": "...",
      "deposit_data_root": "..."
    }
    {second deposit}
    ...'`,
  )
  .action(async (vault: Address, deposits: Deposit[]) => {
    const pdgContract = await getPredepositGuaranteeContract();

    const confirm = await confirmOperation(
      `Are you sure you want to deposit ${deposits.length} deposits to the vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract: pdgContract,
      methodName: 'depositToBeaconChain',
      payload: [vault, deposits],
    });
  });

pdgWrite
  .command('top-up')
  .description('top up no balance')
  .argument('<nodeOperator>', 'node operator address')
  .argument('<amount>', 'amount in ETH', etherToWei)
  .action(async (nodeOperator: Address, amount: bigint) => {
    const pdgContract = await getPredepositGuaranteeContract();

    const confirm = await confirmOperation(
      `Are you sure you want to top up the node operator ${nodeOperator} with ${formatEther(amount)} ETH?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract: pdgContract,
      methodName: 'topUpNodeOperatorBalance',
      payload: [nodeOperator],
      value: amount,
    });
  });

pdgWrite
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

      await callWriteMethodWithReceipt({
        contract: pdgContract,
        methodName: 'proveUnknownValidator',
        payload: [
          { proof, pubkey, validatorIndex, childBlockTimestamp },
          vault,
        ],
      });
    } catch (err) {
      hideSpinner();
      printError(err, 'Error when proving unknown validator');
    }
  });

pdgWrite
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

      await callWriteMethodWithReceipt({
        contract: pdgContract,
        methodName: 'proveInvalidValidatorWC',
        payload: [
          { proof, pubkey, validatorIndex, childBlockTimestamp },
          invalidWithdrawalCredentials,
        ],
      });
    } catch (err) {
      hideSpinner();
      printError(err, 'Error when making proof');
    }
  });

pdgWrite
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

    await callWriteMethodWithReceipt({
      contract: pdgContract,
      methodName: 'withdrawNodeOperatorBalance',
      payload: [nodeOperator, amount, recipient],
    });
  });

pdgWrite
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

    await callWriteMethodWithReceipt({
      contract: pdgContract,
      methodName: 'setNodeOperatorGuarantor',
      payload: [guarantor],
    });
  });

pdgWrite
  .command('claim-guarantor-refund')
  .aliases(['claim-g-refund'])
  .description('claim guarantor refund')
  .argument('<recipient>', 'recipient address')
  .action(async (recipient: Address) => {
    const pdgContract = await getPredepositGuaranteeContract();
    const account = getAccount();

    const confirm = await confirmOperation(
      `Are you sure you want to claim the guarantor ${account.address} refund for ${recipient}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract: pdgContract,
      methodName: 'claimGuarantorRefund',
      payload: [recipient],
    });
  });

pdgWrite
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

    await callWriteMethodWithReceipt({
      contract: pdgContract,
      methodName: 'compensateDisprovenPredeposit',
      payload: [pubkey, recipient],
    });
  });

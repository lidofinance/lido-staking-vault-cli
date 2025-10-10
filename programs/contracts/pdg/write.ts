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
  etherToWei,
  callReadMethod,
  logResult,
  logInfo,
  confirmOperation,
  confirmMakeProof,
  getCommandsJson,
  isValidBLSDeposit,
  expandBLSSignature,
  logTable,
  stringToNumber,
  stringToNumberArray,
  stringToBigIntArray,
  parseValidatorTopUpArray,
} from 'utils';
import { Deposit, ValidatorTopUp } from 'types';

import { pdg } from './main.js';
import { makePDGProofByIndexes } from 'features/deposits/make-pdg-proof.js';

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
  .description(
    "deposits NO's validators with PREDEPOSIT_AMOUNT ether from StakingVault and locks up NO's balance",
  )
  .argument('<vault>', 'vault address')
  .argument('<deposits>', 'deposits', parseDepositArray)
  .option('--no-bls-check', 'skip bls signature check')
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
  .description(
    'permissionless method to prove correct Withdrawal Credentials for the validator and to send the activation deposit',
  )
  .argument('<index>', 'validator index', stringToNumber)
  .action(async (index: number) => {
    const pdgContract = await getPredepositGuaranteeContract();

    const validatorIndex = await confirmMakeProof(index);
    if (!validatorIndex) return;

    const hideSpinner = showSpinner({
      type: 'bouncingBar',
      message: 'Making proof...',
    });
    try {
      const packageProof = await createPDGProof(validatorIndex);
      hideSpinner();
      const {
        proof,
        pubkey,
        childBlockTimestamp,
        withdrawalCredentials,
        slot,
        proposerIndex,
      } = packageProof;

      logResult({});
      logInfo('----------------------proof----------------------');
      logInfo(proof);
      logInfo('-------------------------------------------------');
      logTable({
        data: [
          ['Pubkey', pubkey],
          ['Child Block Timestamp', childBlockTimestamp],
          ['Withdrawal Credentials', withdrawalCredentials],
        ],
      });
      logInfo('-----------------------end-----------------------');

      await callWriteMethodWithReceipt({
        contract: pdgContract,
        methodName: 'proveWCAndActivate',
        payload: [
          {
            proof,
            pubkey,
            validatorIndex: BigInt(validatorIndex),
            childBlockTimestamp,
            slot,
            proposerIndex,
          },
        ],
      });
    } catch (err) {
      hideSpinner();
      printError(err, 'Error when making proof');
    }
  });

pdgWrite
  .command('prove-and-top-up')
  .description(
    'prove validators to unlock NO balance, activate the validators from stash, and optionally top up NO balance',
  )
  .argument('<indexes>', 'validator indexes', stringToNumberArray)
  .argument(
    '<amounts>',
    'array of amounts to top up NO balance',
    stringToBigIntArray,
  )
  .action(async (indexes: number[], amounts: bigint[]) => {
    const pdgContract = await getPredepositGuaranteeContract();

    const witnesses = await makePDGProofByIndexes(indexes);
    if (!witnesses) return;

    await callWriteMethodWithReceipt({
      contract: pdgContract,
      methodName: 'proveWCActivateAndTopUpValidators',
      payload: [witnesses, amounts],
    });
  });

pdgWrite
  .command('top-up-existing-validators')
  .aliases(['top-up-val'])
  .description('deposits ether to proven validators from staking vault')
  .argument(
    '<topUps>',
    'array of ValidatorTopUp structs with pubkey and amounts',
    parseValidatorTopUpArray,
  )
  .addHelpText(
    'after',
    `ValidatorTopUp format:
    '[{
      "pubkey": "...",
      "amount": "...",
    }
    {second topUp}
    ...]'`,
  )
  .action(async (topUps: ValidatorTopUp[]) => {
    const pdgContract = await getPredepositGuaranteeContract();

    const confirm = await confirmOperation(
      `Are you sure you want to top up ${topUps.length} validators with ${topUps.map((topUp) => formatEther(topUp.amount)).join(', ')} ETH?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract: pdgContract,
      methodName: 'topUpExistingValidators',
      payload: [topUps],
    });
  });

pdgWrite
  .command('top-up-no')
  .description('top up Node Operator balance')
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

// TODO: Temporary disabled, because it's required to be owner of the vault
// pdgWrite
//   .command('prove-unknown-validator')
//   .description('prove unknown validator')
//   .argument('<vault>', 'vault address')
//   .argument('<index>', 'validator index', stringToBigInt)
//   .action(async (vault: Address, index: bigint) => {
//     const pdgContract = await getPredepositGuaranteeContract();

//     const validatorIndex = await confirmMakeProof(index);
//     if (!validatorIndex) return;

//     const hideSpinner = showSpinner({
//       type: 'bouncingBar',
//       message: 'Making proof...',
//     });
//     try {
//       const packageProof = await createPDGProof(Number(validatorIndex));
//       hideSpinner();

//       const { proof, pubkey, childBlockTimestamp, withdrawalCredentials } =
//         packageProof;

//       logResult({});
//       logInfo('----------------------proof----------------------');
//       logInfo(proof);
//       logTable({
//         data: [
//           ['Pubkey', pubkey],
//           ['Child Block Timestamp', childBlockTimestamp],
//           ['Withdrawal Credentials', withdrawalCredentials],
//         ],
//       });
//       logInfo('-----------------------end-----------------------');

//       await callWriteMethodWithReceipt({
//         contract: pdgContract,
//         methodName: 'proveUnknownValidator',
//         payload: [
//           { proof, pubkey, validatorIndex, childBlockTimestamp },
//           vault,
//         ],
//       });
//     } catch (err) {
//       hideSpinner();
//       printError(err, 'Error when proving unknown validator');
//     }
//   });

pdgWrite
  .command('prove-invalid-validator-wc')
  .description(
    'permissionless method to prove and compensate incorrect Withdrawal Credentials for the validator on CL',
  )
  .argument('<index>', 'validator index', stringToNumber)
  .argument('<invalidWithdrawalCredentials>', 'invalid withdrawal credentials')
  .action(async (index: number, invalidWithdrawalCredentials: Hex) => {
    const pdgContract = await getPredepositGuaranteeContract();

    const validatorIndex = await confirmMakeProof(index);
    if (!validatorIndex) return;

    const hideSpinner = showSpinner({
      type: 'bouncingBar',
      message: 'Making proof...',
    });

    try {
      const packageProof = await createPDGProof(validatorIndex);
      hideSpinner();
      const {
        proof,
        pubkey,
        childBlockTimestamp,
        withdrawalCredentials,
        slot,
        proposerIndex,
      } = packageProof;

      logResult({});
      logInfo('----------------------proof----------------------');
      logInfo(proof);
      logTable({
        data: [
          ['Pubkey', pubkey],
          ['Child Block Timestamp', childBlockTimestamp],
          ['Withdrawal Credentials', withdrawalCredentials],
          ['Invalid Withdrawal Credentials', invalidWithdrawalCredentials],
        ],
      });
      logInfo('-----------------------end-----------------------');

      if (withdrawalCredentials !== invalidWithdrawalCredentials) {
        logInfo('withdrawal credentials are valid. Operation cancelled');
        return;
      }

      await callWriteMethodWithReceipt({
        contract: pdgContract,
        methodName: 'proveInvalidValidatorWC',
        payload: [
          {
            proof,
            pubkey,
            validatorIndex: BigInt(validatorIndex),
            childBlockTimestamp,
            slot,
            proposerIndex,
          },
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
    const account = await getAccount();

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
    const account = await getAccount();

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

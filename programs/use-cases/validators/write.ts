import {
  logInfo,
  stringTo2dArray,
  stringToAddress,
  stringToArray,
  callWriteMethodWithReceipt,
  callReadMethod,
  fetchValidatorInfo,
  finalityCheckpoints,
} from 'utils';
import { validators } from './main.js';
import { Address, Hex } from 'viem';
import { getValidatorConsolidationRequestsContract } from 'contracts/validator-consolidation-requests.js';
import assert from 'assert';

const feeIncrease = 20n;

const validatorsWrite = validators
  .command('write')
  .aliases(['w'])
  .description('validators write commands');

validatorsWrite
  .command('eoa')
  .description('consolidate validators')
  .argument(
    '<source_pubkeys>',
    '2D array of source validator pubkeys: each inner list will be consolidated into a single target validator',
    stringTo2dArray,
  )
  .argument(
    '<target_pubkeys>',
    'List of target validator public keys to consolidate into. One target pubkey per group of source pubkeys',
    stringToArray,
  )
  .argument('<refund_recipient>', 'refund recipient address', stringToAddress)
  .argument('<staking_vault>', 'staking vault address', stringToAddress)
  .action(
    async (
      sourcePubkeys: string[][],
      targetPubkeys: string[],
      refundRecipient: Address,
      stakingVault: Address,
    ) => {
      logInfo('account abstraction tx');
      logInfo('sourcePubkeys:', sourcePubkeys);
      logInfo('targetPubkeys:', targetPubkeys);
      logInfo('refundRecipient:', refundRecipient);
      logInfo('stakingVault:', stakingVault);

      const finalityCheckpointsInfo = await finalityCheckpoints();
      const finalizedEpoch = Number(
        finalityCheckpointsInfo.data.finalized.epoch,
      );

      // 1. check source pubkeys
      const sourcePubkeysFlat = sourcePubkeys.flat() as Hex[];
      const sourceValidatorsInfo = await fetchValidatorInfo(sourcePubkeysFlat);
      const activeValidators = sourceValidatorsInfo.data.filter(
        (validator) => validator.status === 'active_ongoing',
      );
      assert(
        activeValidators.length === sourcePubkeysFlat.length,
        'All source pubkeys must be active',
      );

      const wrongWCSourceValidators = sourceValidatorsInfo.data.filter(
        (validator) =>
          validator.validator.withdrawal_credentials.startsWith('0x00'),
      );
      assert(
        wrongWCSourceValidators.length === 0,
        'All source pubkeys must have a withdrawal credentials starting with 0x01 or 0x02',
      );

      const sourceValidatorsWithLess256Epochs =
        sourceValidatorsInfo.data.filter(
          (validator) =>
            finalizedEpoch - Number(validator.validator.activation_epoch) < 256,
        );
      assert(
        sourceValidatorsWithLess256Epochs.length === 0,
        'All source pubkeys must have an activation epoch less than the finalized epoch by at least 256 epochs',
      );

      const totalBalance = sourceValidatorsInfo.data.reduce(
        (sum, validator) => sum + Number(validator.balance),
        0,
      );

      // 2. check target pubkeys
      const targetValidatorsInfo = await fetchValidatorInfo(
        targetPubkeys as Hex[],
      );
      const activeTargetValidators = targetValidatorsInfo.data.filter(
        (validator) => validator.status === 'active_ongoing',
      );
      assert(
        activeTargetValidators.length === targetPubkeys.length,
        'All target pubkeys must be active',
      );

      const wrongWCTargetValidators = targetValidatorsInfo.data.filter(
        (validator) =>
          !validator.validator.withdrawal_credentials.startsWith('0x02'),
      );
      assert(
        wrongWCTargetValidators.length === 0,
        'All target pubkeys must have a withdrawal credentials starting with 0x02',
      );

      // 3. Request consolidation
      const consolidationContract = getValidatorConsolidationRequestsContract();

      const feePerConsolidationRequest = await callReadMethod(
        consolidationContract,
        'getConsolidationRequestFee',
      );
      const totalFee =
        (feePerConsolidationRequest *
          BigInt(sourcePubkeysFlat.length) *
          (100n + feeIncrease)) /
        100n;

      const sourcePubkeysFlattened = sourcePubkeys.map(
        (group) => '0x' + group.map((p) => p.replace(/^0x/, '')).join(''),
      ) as Hex[];
      await callWriteMethodWithReceipt({
        contract: consolidationContract,
        methodName: 'addConsolidationRequestsEOA',
        payload: [
          sourcePubkeysFlattened,
          targetPubkeys as Hex[],
          refundRecipient,
          stakingVault,
          BigInt(totalBalance),
        ],
        value: totalFee,
        withSpinner: false,
        silent: true,
      });
    },
  );

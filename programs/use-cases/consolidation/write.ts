import {
  stringTo2dArray,
  stringToAddress,
  stringToHexArray,
  fetchValidatorsInfo,
  finalityCheckpoints,
  checkSourceValidators,
  checkTargetValidators,
} from 'utils';
import { consolidation } from './main.js';
import { Address, Hex, zeroAddress } from 'viem';
import { checkPubkeys } from 'utils/pubkeys-checks.js';
import {
  revokeDelegate,
  requestConsolidation,
} from 'features/consolidation.js';

const consolidationWrite = consolidation
  .command('write')
  .aliases(['w'])
  .description('consolidation write commands');

consolidationWrite
  .command('eoa-with-delegate')
  .description(
    'Set the Lido Consolidation contract as the delegate for the EOA using EIP-7702, call its method to consolidate N validators, and then revoke the authorization.',
  )
  .argument(
    '<source_pubkeys>',
    '2D array of source validator pubkeys: each inner list will be consolidated into a single target validator',
    stringTo2dArray,
  )
  .argument(
    '<target_pubkeys>',
    'List of target validator public keys to consolidate into. One target pubkey per group of source pubkeys',
    stringToHexArray,
  )
  .argument('<refund_recipient>', 'refund recipient address', stringToAddress)
  .argument('<staking_vault>', 'staking vault address', stringToAddress)
  .action(
    async (
      sourcePubkeys: Hex[][],
      targetPubkeys: Hex[],
      refundRecipient: Address,
      stakingVault: Address,
    ) => {
      // 0. Input validation
      const sourcePubkeysFlat = sourcePubkeys.flat();
      checkPubkeys(sourcePubkeysFlat);
      checkPubkeys(targetPubkeys);
      if (sourcePubkeys.length !== targetPubkeys.length) {
        throw new Error(
          'sourcePubkeys and targetPubkeys must have the same length',
        );
      }
      if (refundRecipient === zeroAddress) {
        throw new Error('refundRecipient must be non-zero address');
      }
      if (stakingVault === zeroAddress) {
        throw new Error('stakingVault must be non-zero address');
      }

      // 1. Check source validators
      const finalityCheckpointsInfo = await finalityCheckpoints();
      const finalizedEpoch = Number(
        finalityCheckpointsInfo.data.finalized.epoch,
      );
      const sourceValidatorsInfo = await fetchValidatorsInfo(sourcePubkeysFlat);
      await checkSourceValidators(sourceValidatorsInfo, finalizedEpoch);

      // 2. Check target validators
      const targetValidatorsInfo = await fetchValidatorsInfo(targetPubkeys);
      await checkTargetValidators(targetValidatorsInfo);

      await requestConsolidation(
        sourcePubkeys,
        targetPubkeys,
        refundRecipient,
        stakingVault,
        sourceValidatorsInfo,
      );
      await revokeDelegate();
    },
  );

consolidationWrite
  .command('eoa-revoke-delegate')
  .description('Revoke delegate for the EOA using EIP-7702')
  .action(async () => revokeDelegate());

import {
  stringTo2dArray,
  stringToAddress,
  stringToHexArray,
  callWriteMethodWithReceiptBatchCalls,
} from 'utils';
import { Address, Hex } from 'viem';
import { consolidation } from './main.js';
import {
  revokeDelegate,
  requestConsolidation,
  checkConsolidationInput,
  checkValidators,
  checkVaultConnection,
} from 'features/consolidation.js';
import { consolidationRequestsAndIncreaseRewardsAdjustment } from 'features/consolidation.js';

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
      await checkConsolidationInput(
        sourcePubkeys,
        targetPubkeys,
        stakingVault,
        refundRecipient,
      );
      const { sourceValidatorsInfo } = await checkValidators(
        sourcePubkeys,
        targetPubkeys,
      );
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

consolidationWrite
  .command('eoa-calls')
  .description(
    'Make separate consolidation requests for each source pubkey, increase rewards adjustment',
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
  .argument('<staking_vault>', 'staking vault address', stringToAddress)
  .action(
    async (
      sourcePubkeys: Hex[][],
      targetPubkeys: Hex[],
      stakingVault: Address,
    ) => {
      await checkConsolidationInput(sourcePubkeys, targetPubkeys, stakingVault);
      const { sourceValidatorsInfo } = await checkValidators(
        sourcePubkeys,
        targetPubkeys,
      );
      const vaultConnection = await checkVaultConnection(stakingVault);
      const populatedTxs =
        await consolidationRequestsAndIncreaseRewardsAdjustment(
          sourcePubkeys,
          targetPubkeys,
          sourceValidatorsInfo,
          vaultConnection.owner,
        );
      await callWriteMethodWithReceiptBatchCalls({
        calls: populatedTxs,
        withSpinner: true,
        silent: false,
        skipError: false,
      });
    },
  );

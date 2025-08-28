import {
  stringTo2dArray,
  stringToAddress,
  stringToHexArray,
  callWriteMethodWithReceiptBatchCalls,
  jsonFileToPubkeys,
} from 'utils';
import { Address, Hex } from 'viem';
import { consolidation } from './main.js';
import {
  revokeDelegate,
  requestConsolidation,
  checkConsolidationInput,
  checkValidators,
} from 'features/consolidation.js';
import { consolidationRequestsAndIncreaseRewardsAdjustment } from 'features/consolidation.js';
import { PubkeyMap } from 'types/common.js';
import { toHex } from 'utils/proof/merkle-utils.js';

const consolidationWrite = consolidation
  .command('write')
  .aliases(['w'])
  .description('consolidation write commands');

consolidationWrite
  .command('eoa-with-delegate')
  .description(
    'Set the Lido Consolidation contract as the delegate for the EOA using EIP-7702, call its method to consolidate N validators, and then revoke the authorization.',
  )
  .argument('<refund_recipient>', 'refund recipient address', stringToAddress)
  .argument('<staking_vault>', 'staking vault address', stringToAddress)
  .option(
    '-s, --source_pubkeys <source_pubkeys>',
    '2D array of source validator pubkeys: each inner list will be consolidated into a single target validator',
    stringTo2dArray,
  )
  .option(
    '-t, --target_pubkeys <target_pubkeys>',
    'List of target validator public keys to consolidate into. One target pubkey per group of source pubkeys',
    stringToHexArray,
  )
  .option(
    '-f, --file <file>',
    'Path to a JSON file containing the source pubkeys and target pubkeys in format: {"targetPubkey0": ["sourcePubkey0", "sourcePubkey1"], "targetPubkey1": ["sourcePubkey2", "sourcePubkey3"]}',
    jsonFileToPubkeys,
  )
  .action(
    async (
      refundRecipient: Address,
      stakingVault: Address,
      {
        source_pubkeys,
        target_pubkeys,
        file,
      }: { source_pubkeys: Hex[][]; target_pubkeys: Hex[]; file: PubkeyMap },
    ) => {
      if (!file && !(source_pubkeys && target_pubkeys)) {
        throw new Error(
          'Provide --file or both --source_pubkeys and --target_pubkeys',
        );
      }
      const sourcePubkeys = file ? Object.values(file) : (source_pubkeys ?? []);
      const targetPubkeys = file
        ? Object.keys(file).map(toHex)
        : (target_pubkeys ?? []);

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
  .action(async () => {
    await revokeDelegate();
  });

consolidationWrite
  .command('eoa-calls')
  .description(
    'Make separate (or batch for WC) consolidation requests for each source pubkey, increase rewards adjustment',
  )
  .argument('<dashboard>', 'dashboard address', stringToAddress)
  .option(
    '-s, --source_pubkeys <source_pubkeys>',
    '2D array of source validator pubkeys: each inner list will be consolidated into a single target validator',
    stringTo2dArray,
  )
  .option(
    '-t, --target_pubkeys <target_pubkeys>',
    'List of target validator public keys to consolidate into. One target pubkey per group of source pubkeys',
    stringToHexArray,
  )
  .option(
    '-f, --file <file>',
    'Path to a JSON file containing the source pubkeys and target pubkeys in format: {"targetPubkey0": ["sourcePubkey0", "sourcePubkey1"], "targetPubkey1": ["sourcePubkey2", "sourcePubkey3"]}',
    jsonFileToPubkeys,
  )
  .action(
    async (
      dashboard: Address,
      {
        source_pubkeys,
        target_pubkeys,
        file,
      }: { source_pubkeys: Hex[][]; target_pubkeys: Hex[]; file: PubkeyMap },
    ) => {
      if (!file && !(source_pubkeys && target_pubkeys)) {
        throw new Error(
          'Provide --file or both --source_pubkeys and --target_pubkeys',
        );
      }
      const sourcePubkeys = file ? Object.values(file) : (source_pubkeys ?? []);
      const targetPubkeys = file
        ? Object.keys(file).map(toHex)
        : (target_pubkeys ?? []);

      await checkConsolidationInput(sourcePubkeys, targetPubkeys, dashboard);
      const { sourceValidatorsInfo } = await checkValidators(
        sourcePubkeys,
        targetPubkeys,
      );
      const populatedTxs =
        await consolidationRequestsAndIncreaseRewardsAdjustment(
          sourcePubkeys,
          targetPubkeys,
          sourceValidatorsInfo,
          dashboard,
        );
      await callWriteMethodWithReceiptBatchCalls({
        calls: populatedTxs,
        withSpinner: true,
        silent: false,
        skipError: false,
      });
    },
  );

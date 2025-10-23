import {
  stringTo2dArray,
  stringToAddress,
  stringToHexArray,
  callWriteMethodWithReceiptBatchCalls,
  jsonFileToPubkeys,
  confirmOperation,
  logTable,
  logInfo,
} from 'utils';
import { Address, Hex, formatGwei } from 'viem';
import { consolidation } from './main.js';
import {
  checkConsolidationInput,
  checkValidators,
} from 'features/consolidation.js';
import { consolidationRequestsAndIncreaseFeeExemption } from 'features/consolidation.js';
import { PubkeyMap } from 'types/common.js';
import { toHex } from 'utils/proof/merkle-utils.js';

consolidation
  .command('write')
  .aliases(['w'])
  .description(
    'Consolidate validators and increase rewards adjustment to fix fee calculation for node-operator',
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

      const { sourceValidatorsInfo, targetValidatorsInfo } =
        await checkValidators(sourcePubkeys, targetPubkeys);

      logInfo('Source Validators Info');
      logTable({
        params: {
          head: ['Pubkey', 'Status', 'Balance', 'index'],
        },
        data: sourceValidatorsInfo.data.map((validator) => [
          validator.validator.pubkey,
          validator.status,
          `${formatGwei(BigInt(validator.balance))} ETH`,
          validator.index,
        ]),
      });

      logInfo('Target Validators Info');
      logTable({
        params: {
          head: ['Pubkey', 'Status', 'Balance', 'index'],
        },
        // eslint-disable-next-line sonarjs/no-identical-functions
        data: targetValidatorsInfo.data.map((validator) => [
          validator.validator.pubkey,
          validator.status,
          `${formatGwei(BigInt(validator.balance))} ETH`,
          validator.index,
        ]),
      });

      const lines = [
        'Are you sure you want to consolidate the following validators?\n',
        ...targetPubkeys.map((target, index) => {
          const sources = sourcePubkeys[index]?.join('\n') || '';
          return `Target: ${target}\nSource: ${sources}\n`;
        }),
        `Dashboard: ${dashboard}`,
      ];
      const confirmFileContent = await confirmOperation(lines.join('\n'));

      if (!confirmFileContent) return;

      const populatedTxs = await consolidationRequestsAndIncreaseFeeExemption(
        sourcePubkeys,
        targetPubkeys,
        sourceValidatorsInfo,
        dashboard,
      );

      const confrim = await confirmOperation(
        `Are you sure you want to proceed with the consolidation? There are will be ${populatedTxs.length} operations to be executed`,
      );
      if (!confrim) return;

      await callWriteMethodWithReceiptBatchCalls({
        calls: populatedTxs,
        withSpinner: true,
        silent: false,
        skipError: false,
      });
    },
  );

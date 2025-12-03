import {
  stringTo2dArray,
  stringToAddress,
  stringToHexArray,
  jsonFileToPubkeys,
  confirmOperation,
  logInfo,
  callWriteMethodWithReceiptBatchCalls,
  logCancel,
} from 'utils';
import { Address, Hex } from 'viem';
import { consolidation } from './main.js';
import {
  consolidateAndIncreaseFeeExemptionWithoutBatching,
  consolidationRequestsAndIncreaseFeeExemption,
} from 'features/consolidation.js';
import {
  checkPubkeysArgs,
  validateConsolidationInput,
  getValidatorsInfo,
  getTargetAndSourceValidatorsInfo,
  logAllSourceValidatorsTable,
  logAllTargetValidatorsTable,
  confirmToConsolidate,
  calculateAndConfirmFeeExemption,
  removeInactiveValidators,
} from 'utils';
import { PubkeyMap } from 'utils/consolidation/types.js';

export const consolidationWrite = consolidation
  .command('write')
  .aliases(['w'])
  .description('consolidation write commands');

consolidationWrite
  .command('consolidate-validators')
  .aliases(['consolidate'])
  .description(
    'consolidate validators and increase rewards adjustment to fix fee calculation for node-operator',
  )
  .argument('<dashboard>', 'dashboard address', stringToAddress)
  .option(
    '-s, --source <source>',
    '2D array of source validator pubkeys: each inner list will be consolidated into a single target validator',
    stringTo2dArray,
  )
  .option(
    '-t, --target <target>',
    'List of target validator public keys to consolidate into. One target pubkey per group of source pubkeys',
    stringToHexArray,
  )
  .option(
    '-f, --file <file>',
    'Path to a JSON file containing the source pubkeys and target pubkeys in format: {"targetPubkey0": ["sourcePubkey0", "sourcePubkey1"], "targetPubkey1": ["sourcePubkey2", "sourcePubkey3"]}',
    jsonFileToPubkeys,
  )
  .option(
    '-b, --batch',
    'Batch the consolidation requests and increase fee exemption amount. Use this option if your wallet supports batching.',
    false,
  )
  .action(
    async (
      dashboard: Address,
      {
        source,
        target,
        file,
        batch,
      }: {
        source: Hex[][];
        target: Hex[];
        file: PubkeyMap;
        batch?: boolean;
      },
    ) => {
      // Validation
      const { sourcePubkeys, targetPubkeys } = checkPubkeysArgs(
        file,
        source,
        target,
      );
      validateConsolidationInput(sourcePubkeys, targetPubkeys, dashboard);

      const { sourceValidatorsInfo, targetValidatorsInfo } =
        await getValidatorsInfo(sourcePubkeys, targetPubkeys);
      const targetAndSourceValidators = getTargetAndSourceValidatorsInfo(
        targetPubkeys,
        targetValidatorsInfo,
        sourcePubkeys,
        sourceValidatorsInfo,
      );
      const feeExemption = await calculateAndConfirmFeeExemption(
        targetAndSourceValidators,
      );

      removeInactiveValidators(targetAndSourceValidators);

      if (targetAndSourceValidators.size === 0) {
        logInfo('No validators to consolidate');
        return;
      }

      await logAllSourceValidatorsTable(targetAndSourceValidators);
      await logAllTargetValidatorsTable(targetAndSourceValidators);
      await confirmToConsolidate(targetAndSourceValidators, dashboard);

      if (batch) {
        const populatedTxs = await consolidationRequestsAndIncreaseFeeExemption(
          targetAndSourceValidators,
          feeExemption,
          dashboard,
        );

        const confirm = await confirmOperation(
          `Are you sure you want to proceed with the consolidation? There are will be ${populatedTxs.length} operations to be executed`,
        );
        if (!confirm) {
          logCancel('User cancelled consolidation');
          return;
        }

        await callWriteMethodWithReceiptBatchCalls({
          calls: populatedTxs,
          withSpinner: true,
          silent: false,
          skipError: false,
        });
      } else {
        await consolidateAndIncreaseFeeExemptionWithoutBatching(
          targetAndSourceValidators,
          feeExemption,
          dashboard,
        );
      }
    },
  );

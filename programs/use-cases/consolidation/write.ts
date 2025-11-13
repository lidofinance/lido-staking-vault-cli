import {
  stringTo2dArray,
  stringToAddress,
  stringToHexArray,
  jsonFileToPubkeys,
  confirmOperation,
  logTable,
  logInfo,
  callWriteMethodWithReceiptBatchCalls,
} from 'utils';
import { Address, Hex, formatUnits } from 'viem';
import { consolidation } from './main.js';
import {
  checkConsolidationInput,
  consolidateAndIncreaseFeeExemptionWithoutBatching,
  requestValidatorsInfo,
  getTargetAndSourceValidatorsInfo,
  getFeeExemption,
  removeInactiveValidators,
  TargetAndSourceValidators,
  forEachValidator,
  consolidationRequestsAndIncreaseFeeExemption,
} from 'features/consolidation.js';
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
  .option(
    '-b, --batch',
    'Batch the consolidation requests and increase fee exemption amount',
    false,
  )
  .action(
    async (
      dashboard: Address,
      {
        source_pubkeys,
        target_pubkeys,
        file,
        batch,
      }: {
        source_pubkeys: Hex[][];
        target_pubkeys: Hex[];
        file: PubkeyMap;
        batch?: boolean;
      },
    ) => {
      if (!file && !(source_pubkeys && target_pubkeys)) {
        throw new Error(
          'Provide --file or both --source_pubkeys and --target_pubkeys',
        );
      }
      const sourcePubkeys = file
        ? (Object.values(file) as Hex[][])
        : (source_pubkeys ?? []);
      const targetPubkeys = file
        ? Object.keys(file).map(toHex)
        : (target_pubkeys ?? []);

      await checkConsolidationInput(sourcePubkeys, targetPubkeys, dashboard);
      const { sourceValidatorsInfo, targetValidatorsInfo } =
        await requestValidatorsInfo(sourcePubkeys, targetPubkeys);
      const targetAndSourceValidators = getTargetAndSourceValidatorsInfo(
        targetPubkeys,
        sourcePubkeys,
        sourceValidatorsInfo,
        targetValidatorsInfo,
      );
      const feeExemption = await getFeeExemption(targetAndSourceValidators);
      logInfo(`Fee Exemption: ${formatUnits(feeExemption, 18)} ETH`);

      removeInactiveValidators(targetAndSourceValidators);

      await logAllSourceValidatorsTable(targetAndSourceValidators);
      await logAllTargetValidatorsTable(targetAndSourceValidators);

      const confirmFileContent = await logConfirmToConsolidate(
        targetAndSourceValidators,
        dashboard,
      );
      if (!confirmFileContent) return;

      if (batch) {
        const populatedTxs = await consolidationRequestsAndIncreaseFeeExemption(
          targetAndSourceValidators,
          sourceValidatorsInfo,
          dashboard,
        );

        const confirm = await confirmOperation(
          `Are you sure you want to proceed with the consolidation? There are will be ${populatedTxs.length} operations to be executed`,
        );
        if (!confirm) return;

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

const logAllTargetValidatorsTable = async (
  targetAndSourceValidators: TargetAndSourceValidators,
) => {
  const rows: Array<[string, string, string, string]> = [];

  await forEachValidator(
    targetAndSourceValidators,
    ({ target, targetValidatorInfo }) => {
      rows.push([
        target,
        targetValidatorInfo.status,
        `${formatUnits(targetValidatorInfo.balance, 18)} ETH`,
        targetValidatorInfo.index,
      ]);
    },
  );

  logInfo('Target Validators Info');
  logTable({
    params: {
      head: ['Pubkey', 'Status', 'Balance', 'index'],
    },
    data: rows,
  });
};

const logAllSourceValidatorsTable = async (
  targetAndSourceValidators: TargetAndSourceValidators,
) => {
  const rows: Array<[string, string, string, string]> = [];

  await forEachValidator(
    targetAndSourceValidators,
    ({ source, sourceValidatorInfo }) => {
      rows.push([
        source,
        sourceValidatorInfo.status,
        `${formatUnits(sourceValidatorInfo.balance, 18)} ETH`,
        sourceValidatorInfo.index,
      ]);
    },
  );

  logInfo('Source Validators Info');
  logTable({
    params: {
      head: ['Pubkey', 'Status', 'Balance', 'index'],
    },
    data: rows,
  });
};

const logConfirmToConsolidate = async (
  targetAndSourceValidators: TargetAndSourceValidators,
  dashboard: Address,
): Promise<boolean> => {
  const lines: string[] = [
    'Are you sure you want to consolidate the following validators?\n',
  ];
  await forEachValidator(targetAndSourceValidators, ({ target, source }) => {
    lines.push(`Source: ${source}\nTarget: ${target}\n`);
  });
  lines.push(`Dashboard: ${dashboard}`);
  return confirmOperation(lines.join('\n'));
};

import { formatUnits } from 'viem';
import { logInfo, logTable } from 'utils';

import { TargetAndSourceValidators } from './types.js';

export const logAllTargetValidatorsTable = async (
  targetAndSourceValidators: TargetAndSourceValidators,
) => {
  const rows: Array<[string, string, string, string]> = [];

  for (const [
    target,
    { info: targetValidatorInfo },
  ] of targetAndSourceValidators) {
    rows.push([
      target,
      targetValidatorInfo.status,
      `${formatUnits(targetValidatorInfo.balance, 18)} ETH`,
      targetValidatorInfo.index,
    ]);
  }

  logInfo('Target Validators Info');
  logTable({
    params: {
      head: ['Pubkey', 'Status', 'Balance', 'index'],
    },
    data: rows,
  });
};

export const logAllSourceValidatorsTable = async (
  targetAndSourceValidators: TargetAndSourceValidators,
) => {
  const rows: Array<[string, string, string, string]> = [];

  for (const [, { sourceValidators }] of targetAndSourceValidators) {
    for (const [source, sourceValidatorInfo] of sourceValidators) {
      rows.push([
        source,
        sourceValidatorInfo.status,
        `${formatUnits(sourceValidatorInfo.balance, 18)} ETH`,
        sourceValidatorInfo.index,
      ]);
    }
  }

  logInfo('Source Validators Info');
  logTable({
    params: {
      head: ['Pubkey', 'Status', 'Balance', 'index'],
    },
    data: rows,
  });
};

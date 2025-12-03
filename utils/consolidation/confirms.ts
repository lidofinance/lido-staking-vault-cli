import { Address, formatUnits } from 'viem';
import { logCancel, confirmOperation } from 'utils';

import { TargetAndSourceValidators } from './types.js';

export const confirmToConsolidate = async (
  targetAndSourceValidators: TargetAndSourceValidators,
  dashboard: Address,
): Promise<void> => {
  const lines: string[] = [
    'Are you sure you want to consolidate the following validators?\n',
  ];
  for (const [target, { sourceValidators }] of targetAndSourceValidators) {
    for (const [source] of sourceValidators) {
      lines.push(`Source: ${source}\nTarget: ${target}\n`);
    }
  }
  lines.push(`Dashboard: ${dashboard}`);
  const confirm = await confirmOperation(lines.join('\n'));

  if (!confirm) {
    logCancel('User cancelled confirmation to consolidate');

    throw new Error('User cancelled consolidation');
  }
};

export const calculateAndConfirmFeeExemption = async (
  targetAndSourceValidators: TargetAndSourceValidators,
): Promise<bigint> => {
  let feeExemption = 0n;

  for (const [, { sourceValidators }] of targetAndSourceValidators) {
    for (const [source, sourceValidatorInfo] of sourceValidators) {
      if (sourceValidatorInfo.status === 'active_ongoing') {
        feeExemption += sourceValidatorInfo.balance;
      } else {
        const confirm = await confirmOperation(
          `Validator with this pubkey ${source} is not in active state. Should we consider its balance for fee exemption?`,
        );
        if (confirm) {
          feeExemption += sourceValidatorInfo.balance;
        }
      }
    }
  }

  const confirmFeeExemption = await confirmOperation(
    `Fee Exemption: ${formatUnits(feeExemption, 18)} ETH. Continue?`,
  );

  if (!confirmFeeExemption) {
    logCancel('User cancelled fee exemption confirmation');

    throw new Error('User cancelled consolidation');
  }

  return feeExemption;
};

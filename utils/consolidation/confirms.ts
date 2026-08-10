import { Address, formatEther } from 'viem';
import { logCancel, logError, confirmOperation } from 'utils';

import { TargetAndSourceValidators } from './types.js';
import { consolidatedBalance } from './validator-info.js';

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

  for (const [target, { sourceValidators }] of targetAndSourceValidators) {
    for (const [source, sourceValidatorInfo] of sourceValidators) {
      if (sourceValidatorInfo.status === 'active_ongoing') {
        feeExemption += consolidatedBalance(sourceValidatorInfo);
        continue;
      }

      // a slashed source is skipped by the consensus layer, so nothing reaches the vault
      if (sourceValidatorInfo.slashed) {
        logError(
          `Validator ${source} is slashed: its balance will not reach the vault, so it is not exempted.`,
        );
        continue;
      }

      // an exit epoch is set both by an accepted consolidation request and by a
      // voluntary/triggered exit, and the two need opposite answers here — only the
      // operator knows which one applies, so ask instead of guessing
      const confirm = await confirmOperation(
        `Validator ${source} is not active (status: ${sourceValidatorInfo.status}), balance ${formatEther(sourceValidatorInfo.balance)} ETH.
    Answer yes only if its consolidation into ${target} was already requested — then that balance still reaches the vault and needs the exemption.
    Answer no if it is exiting for any other reason — then the balance goes to its own withdrawal credentials and must not be exempted.
    Count this validator towards the fee exemption?`,
      );
      if (confirm) {
        feeExemption += consolidatedBalance(sourceValidatorInfo);
      }
    }
  }

  const confirmFeeExemption = await confirmOperation(
    `Fee Exemption: ${formatEther(feeExemption)} ETH. Continue?`,
  );

  if (!confirmFeeExemption) {
    logCancel('User cancelled fee exemption confirmation');

    throw new Error('User cancelled consolidation');
  }

  return feeExemption;
};

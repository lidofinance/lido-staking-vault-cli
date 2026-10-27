import { Hex, parseGwei } from 'viem';

import { ValidatorsInfo } from '../fetch-cl.js';
import { bigIntMin } from '../big-int.js';

import { TargetAndSourceValidators, ValidatorInfo } from './types.js';

// what process_pending_consolidations moves to the target:
// min(balance, effective_balance), and nothing at all for a slashed source
export const consolidatedBalance = (info: ValidatorInfo): bigint =>
  info.slashed ? 0n : bigIntMin(info.balance, info.effectiveBalance);

export const getTargetAndSourceValidatorsInfo = (
  targetPubkeys: Hex[],
  targetValidatorsInfo: ValidatorsInfo,
  sourcePubkeys: Hex[][],
  sourceValidatorsInfo: ValidatorsInfo,
): TargetAndSourceValidators => {
  const targetAndSourceValidatorsInfo: TargetAndSourceValidators = new Map();
  for (const [i, targetPubkey] of targetPubkeys.entries()) {
    const targetValidatorInfo = targetValidatorsInfo.data.find(
      (validator) => validator.validator.pubkey === targetPubkey,
    );
    if (!targetValidatorInfo) {
      throw new Error(`Target validator with pubkey ${targetPubkey} not found`);
    }
    targetAndSourceValidatorsInfo.set(targetPubkey, {
      info: {
        status: targetValidatorInfo.status,
        balance: parseGwei(targetValidatorInfo.balance),
        index: targetValidatorInfo.index,
        effectiveBalance: parseGwei(
          targetValidatorInfo.validator.effective_balance,
        ),
        slashed: targetValidatorInfo.validator.slashed,
      },
      sourceValidators: new Map(),
    });
    const sourcePubkeysGroup = sourcePubkeys[i] ?? [];
    for (const sourcePubkey of sourcePubkeysGroup) {
      const sourceValidatorInfo = sourceValidatorsInfo.data.find(
        (validator) => validator.validator.pubkey === sourcePubkey,
      );
      if (!sourceValidatorInfo) {
        throw new Error(
          `Source validator with pubkey ${sourcePubkey} not found`,
        );
      }
      targetAndSourceValidatorsInfo
        .get(targetPubkey)
        ?.sourceValidators.set(sourcePubkey, {
          status: sourceValidatorInfo.status,
          balance: parseGwei(sourceValidatorInfo.balance),
          index: sourceValidatorInfo.index,
          effectiveBalance: parseGwei(
            sourceValidatorInfo.validator.effective_balance,
          ),
          slashed: sourceValidatorInfo.validator.slashed,
        });
    }
  }
  return targetAndSourceValidatorsInfo;
};

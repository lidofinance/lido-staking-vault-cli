import { Hex, parseGwei } from 'viem';

import { ValidatorsInfo } from '../fetchCL.js';

import { TargetAndSourceValidators } from './types.js';

export const getTargetAndSourceValidatorsInfo = (
  targetPubkeys: Hex[],
  targetValidatorsInfo: ValidatorsInfo,
  sourcePubkeys: Hex[][],
  sourceValidatorsInfo: ValidatorsInfo,
): TargetAndSourceValidators => {
  const targetAndSourceValidatorsInfo: TargetAndSourceValidators = new Map();
  targetPubkeys.forEach((targetPubkey, i) => {
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
      },
      sourceValidators: new Map(),
    });
    const sourcePubkeysGroup = sourcePubkeys[i] ?? [];
    sourcePubkeysGroup.forEach((sourcePubkey) => {
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
        });
    });
  });
  return targetAndSourceValidatorsInfo;
};

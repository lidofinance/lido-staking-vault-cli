import { Hex } from 'viem';
import assert from 'assert';

import {
  finalityCheckpoints,
  fetchValidatorsInfo,
  ValidatorsInfo,
} from '../fetchCL.js';

import { TargetAndSourceValidators } from './types.js';

const MIN_256_EPOCHS = 256;

export const getValidatorsInfo = async (
  sourcePubkeys: Hex[][],
  targetPubkeys: Hex[],
): Promise<{
  sourceValidatorsInfo: ValidatorsInfo;
  targetValidatorsInfo: ValidatorsInfo;
}> => {
  const finalityCheckpointsInfo = await finalityCheckpoints();
  const finalizedEpoch = Number(finalityCheckpointsInfo.data.finalized.epoch);

  const sourcePubkeysFlat = sourcePubkeys.flat();

  const [sourceValidatorsInfo, targetValidatorsInfo] = await Promise.all([
    fetchValidatorsInfo(sourcePubkeysFlat),
    fetchValidatorsInfo(targetPubkeys),
  ]);

  if (sourceValidatorsInfo.data == null) {
    throw new Error('sourceValidatorsInfo.data is null');
  }

  if (targetValidatorsInfo.data == null) {
    throw new Error('targetValidatorsInfo.data is null');
  }

  checkSourceValidators(sourceValidatorsInfo.data, finalizedEpoch);
  checkTargetValidators(targetValidatorsInfo.data);

  return {
    sourceValidatorsInfo,
    targetValidatorsInfo,
  };
};

export const checkSourceValidators = (
  sourceValidatorsInfoData: ValidatorsInfo['data'],
  finalizedEpoch: number,
) => {
  const incorrectWCSourceValidators = sourceValidatorsInfoData.filter(
    (validator) =>
      !validator.validator.withdrawal_credentials.startsWith('0x01') &&
      !validator.validator.withdrawal_credentials.startsWith('0x02'),
  );

  assert(
    incorrectWCSourceValidators.length === 0,
    'All source pubkeys must have a withdrawal credentials starting with 0x01 or 0x02. Wrong pubkeys:' +
      incorrectWCSourceValidators.map((v) => v.validator.pubkey).join(', '),
  );

  const sourceValidatorsWithLess256Epochs = sourceValidatorsInfoData.filter(
    (validator) =>
      finalizedEpoch - Number(validator.validator.activation_epoch) <
      MIN_256_EPOCHS,
  );
  assert(
    sourceValidatorsWithLess256Epochs.length === 0,
    'All source pubkeys must have an activation epoch less than the finalized epoch by at least 256 epochs. Wrong pubkeys:' +
      sourceValidatorsWithLess256Epochs
        .map((v) => v.validator.pubkey)
        .join(', '),
  );
};

export const checkTargetValidators = (
  targetValidatorsInfoData: ValidatorsInfo['data'],
) => {
  const wrongWCTargetValidators = targetValidatorsInfoData.filter(
    (validator) =>
      !validator.validator.withdrawal_credentials.startsWith('0x02'),
  );
  assert(
    wrongWCTargetValidators.length === 0,
    'All target pubkeys must have a withdrawal credentials starting with 0x02. Wrong pubkeys:' +
      wrongWCTargetValidators.map((v) => v.validator.pubkey).join(', '),
  );
};

export const removeInactiveValidators = (
  targetAndSourceValidators: TargetAndSourceValidators,
) => {
  for (const [target, { sourceValidators }] of targetAndSourceValidators) {
    const toDelete: Hex[] = [];
    for (const [source, sourceValidatorInfo] of sourceValidators) {
      if (sourceValidatorInfo.status !== 'active_ongoing') {
        toDelete.push(source);
      }
    }

    for (const source of toDelete) {
      sourceValidators.delete(source);
    }

    if (sourceValidators.size === 0) {
      targetAndSourceValidators.delete(target);
    }
  }
};

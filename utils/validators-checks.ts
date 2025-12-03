import { ValidatorsInfo } from './fetchCL.js';
import assert from 'assert';

export const checkSourceValidators = (
  sourceValidatorsInfoData: ValidatorsInfo['data'],
  finalizedEpoch: number,
) => {
  const correctWCSourceValidators = sourceValidatorsInfoData.filter(
    (validator) =>
      validator.validator.withdrawal_credentials.startsWith('0x01') ||
      validator.validator.withdrawal_credentials.startsWith('0x02'),
  );

  assert(
    sourceValidatorsInfoData.length === correctWCSourceValidators.length,
    'All source pubkeys must have a withdrawal credentials starting with 0x01 or 0x02. Wrong pubkeys:' +
      sourceValidatorsInfoData
        .filter((validator) => !correctWCSourceValidators.includes(validator))
        .map((v) => v.validator.pubkey)
        .join(', '),
  );

  const sourceValidatorsWithLess256Epochs = sourceValidatorsInfoData.filter(
    (validator) =>
      finalizedEpoch - Number(validator.validator.activation_epoch) < 256,
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

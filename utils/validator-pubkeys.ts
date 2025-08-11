import { ValidatorsInfo } from './fetchCL.js';
import assert from 'assert';

export const checkSourcePubkeys = async (
  sourceValidatorsInfo: ValidatorsInfo,
  finalizedEpoch: number,
) => {
  const notActiveValidators = sourceValidatorsInfo.data.filter(
    (validator) => validator.status !== 'active_ongoing',
  );
  assert(
    notActiveValidators.length === 0,
    'All source pubkeys must be active. Wrong pubkeys:' +
      notActiveValidators.map((v) => v.validator.pubkey).join(', '),
  );

  const wrongWCSourceValidators = sourceValidatorsInfo.data.filter(
    (validator) =>
      validator.validator.withdrawal_credentials.startsWith('0x00'),
  );
  assert(
    wrongWCSourceValidators.length === 0,
    'All source pubkeys must have a withdrawal credentials starting with 0x01 or 0x02. Wrong pubkeys:' +
      wrongWCSourceValidators.map((v) => v.validator.pubkey).join(', '),
  );

  const sourceValidatorsWithLess256Epochs = sourceValidatorsInfo.data.filter(
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

export const checkTargetPubkeys = async (
  targetValidatorsInfo: ValidatorsInfo,
) => {
  const notActiveTargetValidators = targetValidatorsInfo.data.filter(
    (validator) => validator.status !== 'active_ongoing',
  );
  assert(
    notActiveTargetValidators.length === 0,
    'All target pubkeys must be active. Wrong pubkeys:' +
      notActiveTargetValidators.map((v) => v.validator.pubkey).join(', '),
  );

  const wrongWCTargetValidators = targetValidatorsInfo.data.filter(
    (validator) =>
      !validator.validator.withdrawal_credentials.startsWith('0x02'),
  );
  assert(
    wrongWCTargetValidators.length === 0,
    'All target pubkeys must have a withdrawal credentials starting with 0x02. Wrong pubkeys:' +
      wrongWCTargetValidators.map((v) => v.validator.pubkey).join(', '),
  );
};

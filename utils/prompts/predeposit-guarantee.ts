import { textPrompt } from './default.js';
import { confirmOperation } from './operations.js';
import { logCancel } from 'utils/logging/console.js';

export const enterValidatorIndex = async () => {
  return await textPrompt('Enter validator index', 'validatorIndex');
};

export const confirmValidatorIndex = async (validatorIndex: number) => {
  return await confirmOperation(
    `Do you want to make proof for validator ${validatorIndex}?`,
  );
};

export const confirmMakeProof = async (index?: number) => {
  let validatorIndex: number | undefined = index;

  if (validatorIndex === undefined) {
    const answerValidatorIndex = await enterValidatorIndex();
    validatorIndex = answerValidatorIndex.validatorIndex;

    if (!validatorIndex) return logCancel('Command cancelled');
  }

  const confirm = await confirmValidatorIndex(validatorIndex);
  if (!confirm) return logCancel('Command cancelled');

  return validatorIndex;
};

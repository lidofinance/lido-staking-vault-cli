import { textPrompt, confirmPrompt } from './default.js';

export const validatorIndexPrompt = async () => {
  return await textPrompt('Enter validator index', 'validatorIndex');
};

export const confirmValidatorIndex = async (validatorIndex: bigint) => {
  return await confirmPrompt(
    `Do you want to create proof for validator ${validatorIndex}?`,
    'confirm',
  );
};

export const confirmCreateProof = async (index: bigint) => {
  let validatorIndex: bigint = index;

  if (!validatorIndex) {
    const answerValidatorIndex = await validatorIndexPrompt();
    validatorIndex = answerValidatorIndex.validatorIndex;

    if (!validatorIndex) {
      console.info('Command cancelled');
      return null;
    }
  }

  const { confirm } = await confirmValidatorIndex(validatorIndex);

  if (!confirm) {
    console.info('Command cancelled');
    return null;
  }

  return validatorIndex;
};

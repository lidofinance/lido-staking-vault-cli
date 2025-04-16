import { program } from 'commander';

import { textPrompt, confirmPrompt } from './default.js';

export const enterValidatorIndex = async () => {
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
    const answerValidatorIndex = await enterValidatorIndex();
    validatorIndex = answerValidatorIndex.validatorIndex;

    if (!validatorIndex) program.error('Command cancelled', { exitCode: 1 });
  }

  const { confirm } = await confirmValidatorIndex(validatorIndex);
  if (!confirm) program.error('Command cancelled', { exitCode: 1 });

  return validatorIndex;
};

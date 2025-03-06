import prompts from 'prompts';

export const textPrompt = <T extends string>(
  message: string,
  name: T,
): Promise<prompts.Answers<T>> => {
  return prompts({
    type: 'text',
    name,
    message,
  });
};

export const confirmPrompt = <T extends string>(
  message: string,
  name: T,
): Promise<prompts.Answers<T>> => {
  return prompts({
    type: 'confirm',
    name,
    message,
    initial: false,
  });
};

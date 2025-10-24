import prompts, { type Choice, type Answers } from 'prompts';
import { stringToAddress } from 'utils';

export const textPrompt = <T extends string>(
  message: string,
  name: T,
): Promise<Answers<T>> => {
  return prompts({
    type: 'text',
    name,
    message,
  });
};

export const confirmPrompt = <T extends string>(
  message: string,
  name: T,
): Promise<Answers<T>> => {
  return prompts({
    type: 'confirm',
    name,
    message,
    initial: false,
  });
};

export const selectPrompt = <T extends string>(
  message: string,
  name: T,
  choices: Choice[],
): Promise<Answers<T>> => {
  return prompts({ type: 'select', name, message, choices });
};

export const numberPrompt = <T extends string>(
  message: string,
  name: T,
): Promise<Answers<T>> => {
  return prompts({ type: 'number', name, message });
};

export const addressPrompt = <T extends string>(
  message: string,
  name: T,
): Promise<Answers<T>> => {
  return prompts({ type: 'text', name, message, format: stringToAddress });
};

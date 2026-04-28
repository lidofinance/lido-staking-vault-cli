import { Address } from 'viem';

import { addressPrompt, stringToAddress } from 'utils';

export const promptAccount = async (
  accountInput: string | undefined,
  message: string,
) => {
  let account: Address;
  if (!accountInput) {
    const accountPrompt = await addressPrompt(message, 'account');
    account = stringToAddress(accountPrompt.account);
  } else {
    account = stringToAddress(accountInput);
  }
  return account;
};

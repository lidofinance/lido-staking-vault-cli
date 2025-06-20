import { Address } from 'viem';

import { getAccount } from 'providers';
import { addressPrompt, confirmOperation } from 'utils';

export const getAddress = async (address?: Address, name?: string) => {
  const account = getAccount();
  const currentAddress = address ?? account.address;
  const isYourself = currentAddress === account.address;

  const confirm = await confirmOperation(
    `Do you want to use ${currentAddress} as the ${name}?${
      isYourself ? ' (yourself)' : ''
    }`,
  );
  if (!confirm) {
    const otherAddress = await addressPrompt(
      `Enter the ${name} address`,
      'address',
    );
    if (!otherAddress.address) throw new Error('Invalid address');
    return otherAddress.address;
  }

  return currentAddress;
};

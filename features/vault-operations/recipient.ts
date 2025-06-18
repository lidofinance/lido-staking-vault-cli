import { Address } from 'viem';

import { getAccount } from 'providers';
import { confirmOperation } from 'utils';

export const getRecipient = async (recipient?: Address) => {
  const account = getAccount();
  const recipientAddress = recipient ?? account.address;
  const isYourself = recipientAddress === account.address;

  const confirm = await confirmOperation(
    `Are you sure you want to use ${recipientAddress} as the recipient?${
      isYourself ? ' (yourself)' : ''
    }`,
  );
  if (!confirm) throw new Error('Operation cancelled');

  return recipientAddress;
};

import type { Hex } from 'viem';

export type Deposit = {
  pubkey: Hex;
  signature: Hex;
  amount: bigint;
  depositDataRoot: Hex;
};

export const parseDepositArray = (str: string): Deposit[] => {
  const trimmed = str.trim();
  if (!trimmed) {
    return [];
  }

  const parsed = JSON.parse('[' + str.trim() + ']', (key, value) => {
    if (key === 'amount') {
      return BigInt(value);
    }
    return value;
  });

  return parsed;
};

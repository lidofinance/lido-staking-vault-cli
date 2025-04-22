import { type Hex } from 'viem';

import { toHex } from './proof/merkle-utils.js';

export type Deposit = {
  pubkey: Hex;
  signature: Hex;
  amount: bigint;
  depositDataRoot: Hex;
};

const toCamelCase = (str: string): string =>
  str.replace(/_([a-z])/g, (_, char) => char.toUpperCase());

export const parseDepositArray = (str: string): Deposit[] => {
  const trimmed = str.trim();
  if (!trimmed) {
    return [];
  }

  const parsed = JSON.parse('[' + trimmed + ']', (key, value) => {
    if (key === '') return value; // root array
    if (key === 'amount') return BigInt(value) * BigInt(10 ** 9); // to wei
    if (typeof value === 'string') {
      return toHex(value);
    }
    return value;
  });

  // Convert keys to camelCase
  const camelCased: Deposit[] = parsed.map((obj: any) => {
    const newObj: any = {};
    for (const key in obj) {
      const camelKey = toCamelCase(key);
      newObj[camelKey] = obj[key];
    }
    return newObj;
  });

  return camelCased;
};

import { program } from 'commander';
import { readFileSync } from 'node:fs';
import { Permit, RoleAssignment, Tier, Deposit, ValidatorTopUp } from 'types';
import { Address, Hex, isAddress, isHex, parseEther } from 'viem';

import { PubkeyMap } from 'utils/consolidation/types.js';

import { toHex } from './proof/merkle-utils.js';

const toCamelCase = (str: string): string =>
  str.replaceAll(/_([a-z])/g, (_, char) => char.toUpperCase());

export const stringToBigIntArray = (value: string) => {
  return value.split(',').map(BigInt);
};

export const stringToBigIntArrayWei = (value: string) => {
  return value.split(',').map(etherToWei);
};

export const stringTo2dArray = (value: string): string[][] => {
  const trimmed = value.replaceAll(/^["']|["']$/g, '');
  return trimmed
    .split(',')
    .map((group) => group.trim().split(/\s+/).filter(Boolean));
};

export const stringToHexArray = (value: string) => {
  return value.split(',').map(toHex);
};

export const stringToHex = (value: string) => {
  return toHex(value);
};

export const jsonToPermit = (value: string) => {
  return JSON.parse(value) as Permit;
};

export const jsonFileToPubkeys = (value: string) => {
  const content = readFileSync(value, 'utf8');
  if (content.length === 0) {
    throw new Error('File is empty');
  }
  const parsed = JSON.parse(content);

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Invalid PubkeyMap format: not an object');
  }

  for (const [key, value] of Object.entries(parsed)) {
    if (!isHex(key)) {
      throw new Error(`Invalid key: ${key}`);
    }

    if (!Array.isArray(value)) {
      throw new TypeError(`Value for key ${key} is not an array`);
    }

    for (const item of value) {
      if (!isHex(item)) {
        throw new Error(`Invalid hex in array for key ${key}: ${item}`);
      }
    }
  }

  return parsed as PubkeyMap;
};

export const jsonToRoleAssignment = (value: string) => {
  return JSON.parse(value) as RoleAssignment[];
};

export const stringToBigInt = BigInt;

export const stringToNumberArray = (value: string) => {
  return value.split(',').map(Number);
};

export const stringArrayToTokenPairs = (
  value: string,
  prev:
    | { result: { address: Address; amount: string }[]; isAmount: boolean }
    | undefined = undefined,
): { result: { address: Address; amount: string }[]; isAmount: boolean } => {
  if (!prev) prev = { result: [], isAmount: false };

  if (!prev.isAmount) {
    if (!isAddress(value, { strict: false })) {
      throw new Error(`Invalid token address: ${value}`);
    }
    prev.result.push({ address: value.toLowerCase() as Address, amount: '' });
    prev.isAmount = true;
  } else {
    const numberAmount = Number(value);
    const prevEntry = prev.result.at(-1);
    if (
      !prevEntry ||
      Number.isNaN(numberAmount) ||
      isAddress(value) ||
      numberAmount <= 0 ||
      !value
    ) {
      throw new Error(
        `Invalid amount: ${value} for token ${prev.result.at(-1)?.address}`,
      );
    }
    prevEntry.amount = value;
    prev.isAmount = false;
  }

  return prev;
};

export const etherToWei = (value: string) => {
  return parseEther(value, 'wei');
};

export const etherToGwei = (value: string) => {
  return parseEther(value, 'gwei');
};

export const etherToWeiArray = (value: string) => {
  return value.split(',').map(etherToWei);
};

export const etherToGweiArray = (value: string) => {
  return value.split(',').map(etherToGwei);
};

export const stringToNumber = (value: string) => {
  if (Number.isNaN(Number(value)) || Number(value) < 0) {
    program.error('value must be a positive number', { exitCode: 1 });
  }
  return Number.parseInt(value);
};

export const stringToBoolean = (value: string) => {
  const val = value.toLowerCase();
  if (val === 'true') return true;
  if (val === 'false') return false;
  program.error('value must be true or false', { exitCode: 1 });
};

export const parseTiers = (value: string) => {
  return JSON.parse(value) as Tier[];
};

export const parseTier = (value: string) => {
  return JSON.parse(value) as Tier;
};

export const parseDeposit = (str: string): Deposit => {
  const trimmed = str.trim();
  if (!trimmed) {
    return {} as Deposit;
  }

  const parsed = JSON.parse(trimmed, (key, value) => {
    if (key === 'amount') return BigInt(value) * BigInt(10 ** 9); // gwei to wei
    if (typeof value === 'string') {
      return toHex(value);
    }
    return value;
  });

  // Convert keys to camelCase
  const camelCased: any = {};
  for (const key in parsed) {
    const camelKey = toCamelCase(key);
    camelCased[camelKey] = parsed[key];
  }

  return camelCased;
};

export const parseDepositArray = (str: string): Deposit[] => {
  const trimmed = str.trim();
  if (!trimmed) {
    return [];
  }

  const parsed = JSON.parse(trimmed, (key, value) => {
    if (key === '') return value; // root array
    if (key === 'amount') return BigInt(value) * BigInt(10 ** 9); // gwei to wei
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

export const parseValidatorTopUpArray = (str: string): ValidatorTopUp[] => {
  const trimmed = str.trim();
  if (!trimmed) {
    return [];
  }

  const parsed = JSON.parse(trimmed, (key, value) => {
    if (key === '') return value; // root array
    if (key === 'amount') return BigInt(value) * BigInt(10 ** 9); // gwei to wei
    if (typeof value === 'string') {
      return toHex(value);
    }
    return value;
  });

  return parsed;
};

export const stringToAddress = (value: string): Address => {
  if (!isAddress(value)) {
    program.error('Address value must be a valid address', { exitCode: 1 });
  }
  return value;
};

export const stringArrayToAddressArray = (
  value: string,
  previous: Address[],
) => {
  return [...previous, stringToAddress(value)];
};

export const stringToHash = (value: string): Hex => {
  if (!isHex(value)) {
    program.error('Hash value must be a valid hash', { exitCode: 1 });
  }
  return value;
};

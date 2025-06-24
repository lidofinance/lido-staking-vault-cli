import { program } from 'commander';
import { Permit, RoleAssignment, Tier, Deposit } from 'types';
import { Address, isAddress, parseEther } from 'viem';

import { toHex } from './proof/merkle-utils.js';

const toCamelCase = (str: string): string =>
  str.replace(/_([a-z])/g, (_, char) => char.toUpperCase());

export const stringToBigIntArray = (value: string) => {
  return value.split(',').map(BigInt);
};

export const stringToBigIntArrayWei = (value: string) => {
  return value.split(',').map(etherToWei);
};

export const stringToHexArray = (value: string) => {
  return value.split(',').map(toHex);
};

export const jsonToPermit = (value: string) => {
  return JSON.parse(value) as Permit;
};

export const jsonToRoleAssignment = (value: string) => {
  return JSON.parse(value) as RoleAssignment[];
};

export const stringToBigInt = (value: string) => {
  return BigInt(value);
};

export const stringToNumberArray = (value: string) => {
  return value.split(',').map(Number);
};

export const etherToWei = (value: string) => {
  return parseEther(value, 'wei');
};

export const stringToNumber = (value: string) => {
  if (isNaN(Number(value)) || Number(value) < 0) {
    program.error('value must be a positive number', { exitCode: 1 });
  }
  return parseInt(value);
};

export const parseTiers = (value: string) => {
  return JSON.parse(value) as Tier[];
};

export const parseTier = (value: string) => {
  return JSON.parse(value) as Tier;
};

export const parseDepositArray = (str: string): Deposit[] => {
  const trimmed = str.trim();
  if (!trimmed) {
    return [];
  }

  const parsed = JSON.parse(trimmed, (key, value) => {
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

export const stringToAddress = (value: string): Address => {
  if (!isAddress(value)) {
    program.error('Address value must be a valid address', { exitCode: 1 });
  }
  return value;
};

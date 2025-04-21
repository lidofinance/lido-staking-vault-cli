import { program } from 'commander';
import { Permit, RoleAssignment, Tier } from 'types';
import { parseEther } from 'viem';

export const stringToBigIntArray = (value: string) => {
  return value.split(',').map(BigInt);
};

export const stringToBigIntArrayWei = (value: string) => {
  return value.split(',').map(etherToWei);
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

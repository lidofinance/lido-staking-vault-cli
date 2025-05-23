import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { program } from 'commander';

import {
  stringToBigIntArray,
  stringToBigIntArrayWei,
  jsonToPermit,
  jsonToRoleAssignment,
  stringToBigInt,
  etherToWei,
  stringToNumber,
  parseTiers,
  parseTier,
  parseDepositArray,
  stringToAddress,
} from '../../utils/arguments.js';

jest.mock('commander', () => ({ program: { error: jest.fn() } }));

let programError: jest.Mock;

beforeEach(() => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  programError = program.error as unknown as jest.Mock;
  jest.clearAllMocks();
});

describe('arguments utils', () => {
  test('stringToBigIntArray', () => {
    expect(stringToBigIntArray('1,2,3')).toEqual([1n, 2n, 3n]);
    expect(() => stringToBigIntArray('1,a')).toThrow();
  });

  test('stringToBigIntArrayWei', () => {
    expect(stringToBigIntArrayWei('1,2')).toEqual([
      1000000000000000000n,
      2000000000000000000n,
    ]);
    expect(stringToBigIntArrayWei('1.5')).toEqual([1500000000000000000n]);
  });

  test('jsonToPermit', () => {
    const permit = { value: '1', deadline: '2', v: 1, r: '0x1', s: '0x2' };
    expect(jsonToPermit(JSON.stringify(permit))).toEqual(permit);
    expect(() => jsonToPermit('{')).toThrow();
  });

  test('jsonToRoleAssignment', () => {
    const roles = [{ account: '0x1', role: '0x2' }];
    expect(jsonToRoleAssignment(JSON.stringify(roles))).toEqual(roles);
    expect(() => jsonToRoleAssignment('{')).toThrow();
  });

  test('stringToBigInt', () => {
    expect(stringToBigInt('42')).toBe(42n);
    expect(stringToBigInt('-5')).toBe(-5n);
  });

  test('etherToWei', () => {
    expect(etherToWei('1')).toBe(1000000000000000000n);
    expect(etherToWei('0.5')).toBe(500000000000000000n);
  });

  test('stringToNumber valid', () => {
    expect(stringToNumber('5')).toBe(5);
    expect(programError).not.toHaveBeenCalled();
  });

  test('stringToNumber invalid', () => {
    stringToNumber('abc');
    expect(programError).toHaveBeenCalled();
    programError.mockClear();
    stringToNumber('-1');
    expect(programError).toHaveBeenCalled();
  });

  test('parseTiers and parseTier', () => {
    const tier = {
      shareLimit: '1',
      reserveRatioBP: '2',
      forcedRebalanceThresholdBP: '3',
      treasuryFeeBP: '4',
    };
    expect(parseTiers(JSON.stringify([tier]))).toEqual([tier]);
    expect(parseTier(JSON.stringify(tier))).toEqual(tier);
    expect(() => parseTiers('[')).toThrow();
  });

  test('parseDepositArray', () => {
    const arr = [
      {
        pubkey: '1234',
        signature: 'beef',
        amount: '1',
        deposit_data_root: 'abcd',
      },
    ];
    const res = parseDepositArray(JSON.stringify(arr));
    expect(res[0]).toHaveProperty('pubkey', '0x1234');
    expect(parseDepositArray('')).toEqual([]);
  });

  test('stringToAddress valid', () => {
    expect(stringToAddress('0x0000000000000000000000000000000000000001')).toBe(
      '0x0000000000000000000000000000000000000001',
    );
  });

  test('stringToAddress invalid', () => {
    stringToAddress('0x123');
    expect(programError).toHaveBeenCalled();
  });
});

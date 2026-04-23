import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { program } from 'commander';
import type { Mock } from 'vitest';

import {
  stringToBigIntArray,
  stringToBigIntArrayWei,
  stringToHexArray,
  jsonToPermit,
  jsonToRoleAssignment,
  stringToBigInt,
  etherToWei,
  stringToNumber,
  parseTiers,
  parseTier,
  parseDepositArray,
  stringToAddress,
  stringTo2dArray,
  stringToHex,
  jsonFileToPubkeys,
  stringToNumberArray,
  etherToGwei,
  etherToWeiArray,
  etherToGweiArray,
  stringToBoolean,
  parseDeposit,
  parseValidatorTopUpArray,
  stringToHash,
} from '../../utils/arguments.js';

const MOCK_HEX_ARRAY = [
  '82f3254f7bf057539113fc6b5971d80958618a9893eea717ab5ad345e083df7fceaf55f48716409d3df5adb4f38c4900',
  '23f3254f7bf057539113fc6b5971d80958618a1234eea717ab5ad345e083df7fceaf55f48716409d3df5adb4f38c4900',
];

vi.mock('commander', () => ({ program: { error: vi.fn() } }));

let programError: Mock;

beforeEach(() => {
  programError = program.error as unknown as Mock;
  vi.clearAllMocks();
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

  test('stringToHexArray', () => {
    expect(stringToHexArray(MOCK_HEX_ARRAY.join(','))).toEqual(
      MOCK_HEX_ARRAY.map((hex) => `0x${hex}`),
    );

    expect(
      stringToHexArray(MOCK_HEX_ARRAY.map((hex) => `0x${hex}`).join(',')),
    ).toEqual(MOCK_HEX_ARRAY.map((hex) => `0x${hex}`));
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

  test('stringToBoolean valid and invalid', () => {
    expect(stringToBoolean('true')).toBe(true);
    expect(stringToBoolean('false')).toBe(false);
    stringToBoolean('maybe');
    expect(programError).toHaveBeenCalled();
  });

  test('stringTo2dArray', () => {
    expect(stringTo2dArray('"a b, c d"')).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ]);
    expect(stringTo2dArray('x y,z')).toEqual([['x', 'y'], ['z']]);
  });

  test('stringToHex', () => {
    expect(stringToHex('abc')).toBe('0xabc');
    expect(stringToHex('0x123')).toBe('0x123');
  });

  test('stringToNumberArray', () => {
    expect(stringToNumberArray('1,2,3')).toEqual([1, 2, 3]);
  });

  test('etherToGwei helpers', () => {
    expect(etherToGwei('1')).toBe(1000000000n);
    expect(etherToWeiArray('1,0.5')).toEqual([
      1000000000000000000n,
      500000000000000000n,
    ]);
    expect(etherToGweiArray('1,2')).toEqual([1000000000n, 2000000000n]);
  });

  test('parseTiers and parseTier', () => {
    const tier = {
      operator: '0x1',
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
        pubkey: MOCK_HEX_ARRAY[0],
        signature: MOCK_HEX_ARRAY[1],
        amount: 1,
        deposit_data_root: MOCK_HEX_ARRAY[1],
      },
    ];
    const res = parseDepositArray(JSON.stringify(arr));
    expect(res[0]).toHaveProperty('pubkey', `0x${MOCK_HEX_ARRAY[0]}`);
    expect(parseDepositArray('')).toEqual([]);
  });

  test('parseDeposit', () => {
    const deposit = parseDeposit(
      JSON.stringify({
        pubkey: MOCK_HEX_ARRAY[0],
        withdrawal_credentials: MOCK_HEX_ARRAY[1],
        deposit_data_root: MOCK_HEX_ARRAY[1],
        amount: 2,
      }),
    );

    expect(deposit).toEqual({
      pubkey: `0x${MOCK_HEX_ARRAY[0]}`,
      withdrawalCredentials: `0x${MOCK_HEX_ARRAY[1]}`,
      depositDataRoot: `0x${MOCK_HEX_ARRAY[1]}`,
      amount: 2000000000n,
    });
    expect(parseDeposit('  ')).toEqual({});
  });

  test('parseValidatorTopUpArray', () => {
    const res = parseValidatorTopUpArray(
      JSON.stringify([{ pubkey: MOCK_HEX_ARRAY[0], amount: 3 }]),
    );
    expect(res).toEqual([
      { pubkey: `0x${MOCK_HEX_ARRAY[0]}`, amount: 3000000000n },
    ]);
    expect(parseValidatorTopUpArray('')).toEqual([]);
  });

  test('jsonFileToPubkeys valid', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'args-'));
    const file = path.join(dir, 'pubkeys.json');
    const content = { '0x01': ['0x02', '0x03'] };
    writeFileSync(file, JSON.stringify(content));

    try {
      expect(jsonFileToPubkeys(file)).toEqual(content);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test('jsonFileToPubkeys invalid', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'args-'));
    const file = path.join(dir, 'pubkeys.json');
    writeFileSync(file, JSON.stringify({ notHex: ['0x02'] }));

    try {
      expect(() => jsonFileToPubkeys(file)).toThrow();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
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

  test('stringToHash valid and invalid', () => {
    expect(stringToHash('0xabc')).toBe('0xabc');
    stringToHash('not-a-hash');
    expect(programError).toHaveBeenCalled();
  });
});

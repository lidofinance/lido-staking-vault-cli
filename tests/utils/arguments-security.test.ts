import { describe, test, expect, vi, beforeEach } from 'vitest';
import { program } from 'commander';
import type { Mock } from 'vitest';

import {
  jsonToRoleAssignment,
  stringToBigInt,
  parseTiers,
  parseTier,
} from '../../utils/arguments.js';

vi.mock('commander', () => ({ program: { error: vi.fn() } }));

let programError: Mock;

beforeEach(() => {
  programError = program.error as unknown as Mock;
  vi.clearAllMocks();
});

describe('jsonToRoleAssignment structural validation (M3)', () => {
  test('rejects non-array JSON', () => {
    expect(() => jsonToRoleAssignment('{"account":"0x1","role":"0x2"}')).toThrow(
      'must be an array',
    );
  });

  test('rejects entries missing account field', () => {
    expect(() => jsonToRoleAssignment('[{"role":"0x2"}]')).toThrow(
      'must contain account and role fields',
    );
  });

  test('rejects entries missing role field', () => {
    expect(() => jsonToRoleAssignment('[{"account":"0x1"}]')).toThrow(
      'must contain account and role fields',
    );
  });

  test('rejects null entries', () => {
    expect(() => jsonToRoleAssignment('[null]')).toThrow(
      'must contain account and role fields',
    );
  });

  test('accepts valid role assignment array', () => {
    const result = jsonToRoleAssignment(
      '[{"account":"0x1","role":"0x2"}]',
    );
    expect(result).toEqual([{ account: '0x1', role: '0x2' }]);
  });
});

describe('stringToBigInt safe parsing (M5)', () => {
  test('parses valid BigInt', () => {
    expect(stringToBigInt('42')).toBe(42n);
  });

  test('parses negative BigInt', () => {
    expect(stringToBigInt('-5')).toBe(-5n);
  });

  test('calls program.error on invalid input', () => {
    stringToBigInt('not-a-number');
    expect(programError).toHaveBeenCalledWith(
      expect.stringContaining('Invalid BigInt value'),
      expect.objectContaining({ exitCode: 1 }),
    );
  });

  test('calls program.error on float input', () => {
    stringToBigInt('1.5');
    expect(programError).toHaveBeenCalledWith(
      expect.stringContaining('Invalid BigInt value'),
      expect.objectContaining({ exitCode: 1 }),
    );
  });
});

describe('parseTiers validation', () => {
  test('rejects non-array JSON', () => {
    expect(() => parseTiers('{"shareLimit":"1"}')).toThrow('must be an array');
  });

  test('accepts valid tiers array', () => {
    const tier = {
      shareLimit: '1',
      reserveRatioBP: '2',
      forcedRebalanceThresholdBP: '3',
      treasuryFeeBP: '4',
    };
    expect(parseTiers(JSON.stringify([tier]))).toEqual([tier]);
  });
});

describe('parseTier validation', () => {
  test('rejects non-object JSON', () => {
    expect(() => parseTier('"string"')).toThrow('must contain operator field');
  });

  test('rejects object without operator field', () => {
    expect(() => parseTier('{"shareLimit":"1"}')).toThrow(
      'must contain operator field',
    );
  });

  test('accepts valid tier with operator', () => {
    const tier = { operator: '0x1', shareLimit: '1' };
    expect(parseTier(JSON.stringify(tier))).toEqual(tier);
  });
});

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { program } from 'commander';
import type { Mock } from 'vitest';

import {
  jsonToRoleAssignment,
  stringToBigInt,
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
});

describe('stringToBigInt safe parsing (M5)', () => {
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

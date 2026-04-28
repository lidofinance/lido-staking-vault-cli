import { describe, expect, test } from 'vitest';
import { zeroHash } from 'viem';
import { DEFAULT_SALT, processSalt } from '../../utils/salt.js';

describe('salt', () => {
  describe('DEFAULT_SALT', () => {
    test('equals viem zeroHash', () => {
      expect(DEFAULT_SALT).toBe(zeroHash);
    });
  });

  describe('processSalt', () => {
    test('returns provided salt when given', () => {
      const salt =
        '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
      expect(processSalt(salt)).toBe(salt);
    });

    test('returns DEFAULT_SALT when called with no arguments', () => {
      expect(processSalt()).toBe(DEFAULT_SALT);
    });
  });
});

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { getConfirmations } from '../../utils/transactions/utils.js';

describe('getConfirmations (H5)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.CONFIRMATIONS;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test('returns default (3) when CONFIRMATIONS not set', () => {
    expect(getConfirmations()).toBe(3);
  });

  test('returns parsed integer when valid', () => {
    process.env.CONFIRMATIONS = '5';
    expect(getConfirmations()).toBe(5);
  });

  test('returns 1 when set to minimum', () => {
    process.env.CONFIRMATIONS = '1';
    expect(getConfirmations()).toBe(1);
  });

  test('rejects 0 confirmations (reorg attack vector)', () => {
    process.env.CONFIRMATIONS = '0';
    expect(() => getConfirmations()).toThrow('must be an integer >= 1');
  });

  test('rejects negative confirmations', () => {
    process.env.CONFIRMATIONS = '-1';
    expect(() => getConfirmations()).toThrow('must be an integer >= 1');
  });

  test('rejects non-integer confirmations', () => {
    process.env.CONFIRMATIONS = '2.5';
    expect(() => getConfirmations()).toThrow('must be an integer >= 1');
  });

  test('rejects non-numeric confirmations', () => {
    process.env.CONFIRMATIONS = 'abc';
    expect(() => getConfirmations()).toThrow('must be an integer >= 1');
  });
});

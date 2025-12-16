import { describe, expect, test } from 'vitest';

import { bigIntMax, bigIntMin } from '../../utils/bigInt.js';

describe('bigIntMax', () => {
  test('returns maximum value from multiple positive bigints', () => {
    expect(bigIntMax(1n, 5n, 3n, 9n, 2n)).toBe(9n);
  });

  test('returns maximum value from multiple negative bigints', () => {
    expect(bigIntMax(-10n, -5n, -20n, -1n)).toBe(-1n);
  });

  test('returns maximum value from mixed positive and negative bigints', () => {
    expect(bigIntMax(-5n, 10n, -20n, 3n, -1n)).toBe(10n);
  });

  test('returns the single value when only one argument is provided', () => {
    expect(bigIntMax(42n)).toBe(42n);
  });

  test('returns correct value when all values are equal', () => {
    expect(bigIntMax(5n, 5n, 5n)).toBe(5n);
  });

  test('handles very large bigint values', () => {
    const largeValue = 999999999999999999999999999999n;
    const smallerValue = 999999999999999999999999999998n;
    expect(bigIntMax(smallerValue, largeValue)).toBe(largeValue);
  });

  test('returns zero when comparing zero with negative values', () => {
    expect(bigIntMax(0n, -5n, -10n)).toBe(0n);
  });

  test('handles two values correctly', () => {
    expect(bigIntMax(100n, 200n)).toBe(200n);
    expect(bigIntMax(200n, 100n)).toBe(200n);
  });
});

describe('bigIntMin', () => {
  test('returns minimum value from multiple positive bigints', () => {
    expect(bigIntMin(1n, 5n, 3n, 9n, 2n)).toBe(1n);
  });

  test('returns minimum value from multiple negative bigints', () => {
    expect(bigIntMin(-10n, -5n, -20n, -1n)).toBe(-20n);
  });

  test('returns minimum value from mixed positive and negative bigints', () => {
    expect(bigIntMin(-5n, 10n, -20n, 3n, -1n)).toBe(-20n);
  });

  test('returns the single value when only one argument is provided', () => {
    expect(bigIntMin(42n)).toBe(42n);
  });

  test('returns correct value when all values are equal', () => {
    expect(bigIntMin(5n, 5n, 5n)).toBe(5n);
  });

  test('handles very large bigint values', () => {
    const largeValue = 999999999999999999999999999999n;
    const smallerValue = 999999999999999999999999999998n;
    expect(bigIntMin(smallerValue, largeValue)).toBe(smallerValue);
  });

  test('returns negative value when comparing zero with negative values', () => {
    expect(bigIntMin(0n, -5n, -10n)).toBe(-10n);
  });

  test('handles two values correctly', () => {
    expect(bigIntMin(100n, 200n)).toBe(100n);
    expect(bigIntMin(200n, 100n)).toBe(100n);
  });
});

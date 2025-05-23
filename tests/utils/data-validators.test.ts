import { describe, expect, test } from '@jest/globals';
import { RoleAssignment } from '../../types/index.js';
import {
  validateConfig,
  isValidUrl,
  transformAddressesToArray,
  validateAddressesMap,
  validateAddressMap,
} from '../../utils/data-validators.js';

describe('data-validators', () => {
  test('validateConfig detects NaN', () => {
    const errors = validateConfig({ CHAIN_ID: NaN, DEPLOYED: 'true' });
    expect(errors).toHaveProperty('CHAIN_ID');
  });

  test('validateConfig passes with number', () => {
    const errors = validateConfig({ CHAIN_ID: 1, DEPLOYED: 'true' });
    expect(errors).toEqual({});
  });

  test('isValidUrl works', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('not a url')).toBe(false);
  });

  test('transformAddressesToArray', () => {
    const role1 = '0x0000000000000000000000000000000000000001';
    const role2 = '0x0000000000000000000000000000000000000002';

    const input: RoleAssignment[] = [
      {
        role: role1,
        account: '0x0000000000000000000000000000000000000001',
      },
      {
        role: role2,
        account: '0x0000000000000000000000000000000000000002',
      },
      {
        role: role1,
        account: '0x0000000000000000000000000000000000000003',
      },
    ];
    const result = transformAddressesToArray(input);
    expect(result).toEqual({
      [role1]: [
        '0x0000000000000000000000000000000000000001',
        '0x0000000000000000000000000000000000000003',
      ],
      [role2]: ['0x0000000000000000000000000000000000000002'],
    });
  });

  test('validateAddressesMap detects invalid addresses', () => {
    const errors = validateAddressesMap({
      test: ['0x0000000000000000000000000000000000000001', '0x123'],
    });
    expect(errors.length).toBe(1);
    expect(errors[0]).toMatch(/not a valid address/);
  });

  test('validateAddressMap detects invalid address', () => {
    const errors = validateAddressMap({
      test: '0x123',
    });
    expect(errors).toEqual(['test is not a valid address']);
  });
});

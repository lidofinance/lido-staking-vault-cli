import { describe, expect, test } from 'vitest';
import { RoleAssignment } from '../../types/index.js';
import {
  assertSafeUrl,
  validateConfig,
  transformAddressesToArray,
  validateAddressesMap,
  validateAddressMap,
} from '../../utils/data-validators.js';

describe('data-validators', () => {
  describe('assertSafeUrl', () => {
    test('passes for http URL', () => {
      expect(() => assertSafeUrl('http://example.com', 'url')).not.toThrow();
    });

    test('passes for https URL', () => {
      expect(() =>
        assertSafeUrl('https://example.com/path?q=1', 'url'),
      ).not.toThrow();
    });

    test('throws for invalid URL', () => {
      expect(() => assertSafeUrl('not-a-url', 'callback URL')).toThrow(
        'callback URL: invalid URL: not-a-url',
      );
    });

    test('throws for ftp scheme', () => {
      expect(() => assertSafeUrl('ftp://example.com', 'url')).toThrow(
        'unsupported URL scheme "ftp:" (only http/https allowed)',
      );
    });

    test('throws for file scheme', () => {
      expect(() => assertSafeUrl('file:///etc/passwd', 'url')).toThrow(
        'unsupported URL scheme "file:" (only http/https allowed)',
      );
    });

    test('includes label in error message', () => {
      expect(() => assertSafeUrl('ftp://example.com', 'my label')).toThrow(
        'my label:',
      );
    });
  });

  test('validateConfig detects NaN', () => {
    const errors = validateConfig({ CHAIN_ID: Number.NaN, DEPLOYED: 'true' });
    expect(errors).toHaveProperty('CHAIN_ID');
  });

  test('validateConfig passes with number', () => {
    const errors = validateConfig({ CHAIN_ID: 1, DEPLOYED: 'true' });
    expect(errors).toEqual({});
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

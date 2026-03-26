import { describe, it, expect } from 'vitest';
import { formatConfirmationArgs } from '../../utils/commands/confirmations.js';
import type { Address } from 'viem';

describe('formatConfirmationArgs', () => {
  it('should format setConfirmExpiry in hours', () => {
    const result = formatConfirmationArgs([3600n], 'setConfirmExpiry');
    expect(result).toBe('1 hours');
  });

  it('should format setConfirmExpiry for multiple hours', () => {
    const result = formatConfirmationArgs([7200n], 'setConfirmExpiry');
    expect(result).toBe('2 hours');
  });

  it('should format setNodeOperatorFeeRate as basis points percentage', () => {
    const result = formatConfirmationArgs([500n], 'setNodeOperatorFeeRate');
    // 500 / 10000 * 100 = 5.00%
    expect(result).toBe('5.00%');
  });

  it('should format changeTier with vault, tier, and share limit', () => {
    const vault = '0x1234567890123456789012345678901234567890' as Address;
    const result = formatConfirmationArgs(
      [vault, 1n, 1000000000000000000n],
      'changeTier',
    );
    expect(result).toContain(vault);
    expect(result).toContain('tier: 1');
    expect(result).toContain('requested share limit: 1 shares');
  });

  it('should format transferVaultOwnership with new owner', () => {
    const newOwner = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' as Address;
    const result = formatConfirmationArgs(
      [newOwner],
      'transferVaultOwnership',
    );
    expect(result).toBe(`new owner: ${newOwner}`);
  });

  it('should throw for unknown function name', () => {
    expect(() =>
      formatConfirmationArgs(
        [1n],
        // @ts-expect-error: testing unknown function name
        'unknownFunction',
      ),
    ).toThrow('Unknown function: unknownFunction');
  });
});

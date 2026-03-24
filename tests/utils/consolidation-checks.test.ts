import { describe, it, expect } from 'vitest';
import { zeroAddress } from 'viem';
import {
  checkPubkeysArgs,
  validateConsolidationInput,
} from '../../utils/consolidation/checks.js';
import {
  VALID_PUBKEY_1,
  VALID_PUBKEY_2,
  VALID_PUBKEY_3,
  SHORT_PUBKEY,
  VALID_DASHBOARD,
  VALID_REFUND_RECIPIENT,
  ZERO_ADDRESS,
} from '../fixtures/consolidation-fixtures.js';

describe('checkPubkeysArgs', () => {
  it('should extract pubkeys from file when file is provided', () => {
    const file = {
      [VALID_PUBKEY_1]: [VALID_PUBKEY_2, VALID_PUBKEY_3],
    };
    const result = checkPubkeysArgs(file, [], []);
    expect(result.targetPubkeys).toHaveLength(1);
    expect(result.sourcePubkeys).toHaveLength(1);
    expect(result.sourcePubkeys[0]).toEqual([VALID_PUBKEY_2, VALID_PUBKEY_3]);
  });

  it('should use explicit pubkeys when file is not provided', () => {
    const sourcePubkeys = [[VALID_PUBKEY_2]];
    const targetPubkeys = [VALID_PUBKEY_1];
    // @ts-expect-error: testing with null file
    const result = checkPubkeysArgs(null, sourcePubkeys, targetPubkeys);
    expect(result.sourcePubkeys).toEqual(sourcePubkeys);
    expect(result.targetPubkeys).toEqual(targetPubkeys);
  });

  it('should throw when neither file nor pubkeys are provided', () => {
    expect(() =>
      // @ts-expect-error: testing with null/undefined
      checkPubkeysArgs(null, undefined, undefined),
    ).toThrow('Provide --file or both --source_pubkeys and --target_pubkeys');
  });

  it('should prefer file over explicit pubkeys', () => {
    const file = { [VALID_PUBKEY_1]: [VALID_PUBKEY_2] };
    const result = checkPubkeysArgs(file, [[VALID_PUBKEY_3]], [VALID_PUBKEY_3]);
    // File keys become targets
    expect(result.targetPubkeys).toHaveLength(1);
    expect(result.sourcePubkeys[0]).toEqual([VALID_PUBKEY_2]);
  });

  it('should handle file with multiple targets', () => {
    const file = {
      [VALID_PUBKEY_1]: [VALID_PUBKEY_2],
      [VALID_PUBKEY_3]: [VALID_PUBKEY_2],
    };
    const result = checkPubkeysArgs(file, [], []);
    expect(result.targetPubkeys).toHaveLength(2);
    expect(result.sourcePubkeys).toHaveLength(2);
  });
});

describe('validateConsolidationInput', () => {
  it('should pass with valid input', () => {
    expect(() =>
      validateConsolidationInput(
        [[VALID_PUBKEY_2]],
        [VALID_PUBKEY_1],
        VALID_DASHBOARD,
        VALID_REFUND_RECIPIENT,
      ),
    ).not.toThrow();
  });

  it('should pass with empty arrays', () => {
    expect(() =>
      validateConsolidationInput([], [], VALID_DASHBOARD),
    ).not.toThrow();
  });

  it('should throw when source and target lengths mismatch', () => {
    expect(() =>
      validateConsolidationInput(
        [[VALID_PUBKEY_2], [VALID_PUBKEY_3]],
        [VALID_PUBKEY_1],
        VALID_DASHBOARD,
      ),
    ).toThrow('sourcePubkeys and targetPubkeys must have the same length');
  });

  it('should throw when pubkey has wrong byte count (47 bytes)', () => {
    expect(() =>
      validateConsolidationInput(
        [[SHORT_PUBKEY]],
        [VALID_PUBKEY_1],
        VALID_DASHBOARD,
      ),
    ).toThrow('Invalid pubkeys (must be hex 0x + 48 bytes)');
  });

  it('should throw when source pubkey is invalid', () => {
    expect(() =>
      validateConsolidationInput(
        [[SHORT_PUBKEY]],
        [VALID_PUBKEY_1],
        VALID_DASHBOARD,
      ),
    ).toThrow('Invalid pubkeys');
  });

  it('should throw when target pubkey is invalid', () => {
    expect(() =>
      validateConsolidationInput(
        [[VALID_PUBKEY_2]],
        [SHORT_PUBKEY],
        VALID_DASHBOARD,
      ),
    ).toThrow('Invalid pubkeys');
  });

  it('should throw when refundRecipient is zero address', () => {
    expect(() =>
      validateConsolidationInput(
        [[VALID_PUBKEY_2]],
        [VALID_PUBKEY_1],
        VALID_DASHBOARD,
        ZERO_ADDRESS,
      ),
    ).toThrow('refundRecipient must be non-zero address');
  });

  it('should pass when refundRecipient is undefined', () => {
    expect(() =>
      validateConsolidationInput(
        [[VALID_PUBKEY_2]],
        [VALID_PUBKEY_1],
        VALID_DASHBOARD,
        undefined,
      ),
    ).not.toThrow();
  });

  it('should throw when dashboard is zero address', () => {
    expect(() =>
      validateConsolidationInput(
        [[VALID_PUBKEY_2]],
        [VALID_PUBKEY_1],
        zeroAddress,
      ),
    ).toThrow('dashboard address must be non-zero address');
  });

  it('should validate multiple source pubkeys in nested arrays', () => {
    expect(() =>
      validateConsolidationInput(
        [[VALID_PUBKEY_2, VALID_PUBKEY_3]],
        [VALID_PUBKEY_1],
        VALID_DASHBOARD,
      ),
    ).not.toThrow();
  });
});

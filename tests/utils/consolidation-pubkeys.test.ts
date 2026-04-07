import { describe, it, expect } from 'vitest';
import type { Hex } from 'viem';
import {
  flattenSourcePubkeys,
  getSourceAndTargetPubkeysFromEncodedCall,
  addDummyTargetAndSourceValidator,
} from '../../utils/consolidation/pubkeys.js';
import {
  VALID_PUBKEY_1,
  VALID_PUBKEY_2,
  VALID_PUBKEY_3,
  ZERO_PUBKEY,
  createTargetAndSourceMap,
} from '../fixtures/consolidation-fixtures.js';

describe('flattenSourcePubkeys', () => {
  it('should flatten single target with single source', () => {
    const map = createTargetAndSourceMap([
      { target: VALID_PUBKEY_1, sources: [{ pubkey: VALID_PUBKEY_2 }] },
    ]);
    const result = flattenSourcePubkeys(map);
    expect(result).toHaveLength(1);
    // Should be the source pubkey without 0x prefix, re-prefixed
    expect(result[0]).toBe(`0x${'bb'.repeat(48)}`);
  });

  it('should concatenate multiple sources for single target', () => {
    const map = createTargetAndSourceMap([
      {
        target: VALID_PUBKEY_1,
        sources: [{ pubkey: VALID_PUBKEY_2 }, { pubkey: VALID_PUBKEY_3 }],
      },
    ]);
    const result = flattenSourcePubkeys(map);
    expect(result).toHaveLength(1);
    // Two 48-byte pubkeys concatenated (without 0x) = 192 hex chars
    expect(result[0]).toBe(`0x${'bb'.repeat(48)}${'cc'.repeat(48)}`);
  });

  it('should produce separate entries for multiple targets', () => {
    const map = createTargetAndSourceMap([
      { target: VALID_PUBKEY_1, sources: [{ pubkey: VALID_PUBKEY_2 }] },
      { target: VALID_PUBKEY_3, sources: [{ pubkey: VALID_PUBKEY_2 }] },
    ]);
    const result = flattenSourcePubkeys(map);
    expect(result).toHaveLength(2);
  });

  it('should return empty array for empty map', () => {
    const emptyMap = createTargetAndSourceMap([]);
    expect(flattenSourcePubkeys(emptyMap)).toEqual([]);
  });
});

describe('getSourceAndTargetPubkeysFromEncodedCall', () => {
  it('should split encoded call into source and target pubkeys', () => {
    // Two 48-byte pubkeys encoded together: source + target
    const source = 'aa'.repeat(48);
    const target = 'bb'.repeat(48);
    const encodedCall = `0x${source}${target}` as Hex;

    const result = getSourceAndTargetPubkeysFromEncodedCall(encodedCall);
    expect(result.sourcePubkey).toBe(`0x${source}`);
    expect(result.targetPubkey).toBe(`0x${target}`);
  });

  it('should return 0x-prefixed hex values', () => {
    const encodedCall = `0x${'aa'.repeat(4)}${'bb'.repeat(4)}` as Hex;
    const result = getSourceAndTargetPubkeysFromEncodedCall(encodedCall);
    expect(result.sourcePubkey.startsWith('0x')).toBe(true);
    expect(result.targetPubkey.startsWith('0x')).toBe(true);
  });

  it('should handle minimum-length input', () => {
    const encodedCall = '0xaabb' as Hex;
    const result = getSourceAndTargetPubkeysFromEncodedCall(encodedCall);
    expect(result.sourcePubkey).toBe('0xaa');
    expect(result.targetPubkey).toBe('0xbb');
  });

  it('should split evenly for typical 96-byte pubkey pairs', () => {
    const source = 'ab'.repeat(48);
    const target = 'cd'.repeat(48);
    const encodedCall = `0x${source}${target}` as Hex;

    const result = getSourceAndTargetPubkeysFromEncodedCall(encodedCall);
    expect(result.sourcePubkey.length).toBe(2 + 96); // 0x + 96 hex chars
    expect(result.targetPubkey.length).toBe(2 + 96);
  });
});

describe('addDummyTargetAndSourceValidator', () => {
  it('should add a zero-pubkey entry to the map', () => {
    const map = createTargetAndSourceMap([]);
    addDummyTargetAndSourceValidator(map, 1000000000n);
    expect(map.size).toBe(1);
    expect(map.has(ZERO_PUBKEY)).toBe(true);
  });

  it('should set balance and effectiveBalance from feeExemption', () => {
    const map = createTargetAndSourceMap([]);
    const feeExemption = 5000000000n;
    addDummyTargetAndSourceValidator(map, feeExemption);

    const entry = map.get(ZERO_PUBKEY);
    expect(entry?.info.balance).toBe(feeExemption);
    expect(entry?.info.effectiveBalance).toBe(feeExemption);
  });

  it('should set status to active_ongoing', () => {
    const map = createTargetAndSourceMap([]);
    addDummyTargetAndSourceValidator(map, 1000000000n);
    const entry = map.get(ZERO_PUBKEY);
    expect(entry?.info.status).toBe('active_ongoing');
  });

  it('should not affect existing entries', () => {
    const map = createTargetAndSourceMap([
      { target: VALID_PUBKEY_1, sources: [{ pubkey: VALID_PUBKEY_2 }] },
    ]);
    addDummyTargetAndSourceValidator(map, 1000000000n);
    expect(map.size).toBe(2);
    expect(map.has(VALID_PUBKEY_1)).toBe(true);
    expect(map.has(ZERO_PUBKEY)).toBe(true);
  });
});

import { describe, it, expect } from 'vitest';
import { hoodi, mainnet } from 'viem/chains';
import {
  BASIS_POINTS_DENOMINATOR,
  DECIMALS,
  SCALING_FACTOR,
  V3_START_BLOCKS,
} from '../../utils/consts.js';

describe('consts', () => {
  it('should have BASIS_POINTS_DENOMINATOR equal to 10000', () => {
    expect(BASIS_POINTS_DENOMINATOR).toBe(10_000n);
  });

  it('should have DECIMALS equal to 18', () => {
    expect(DECIMALS).toBe(18n);
  });

  it('should have SCALING_FACTOR equal to 10^DECIMALS', () => {
    expect(SCALING_FACTOR).toBe(10n ** DECIMALS);
    expect(SCALING_FACTOR).toBe(1000000000000000000n);
  });

  it('should have V3_START_BLOCKS for mainnet', () => {
    expect(V3_START_BLOCKS[mainnet.id]).toBeDefined();
    expect(V3_START_BLOCKS[mainnet.id]).toBeGreaterThan(0n);
  });

  it('should have V3_START_BLOCKS for hoodi', () => {
    expect(V3_START_BLOCKS[hoodi.id]).toBeDefined();
    expect(V3_START_BLOCKS[hoodi.id]).toBeGreaterThan(0n);
  });
});

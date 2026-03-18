import { describe, it, expect } from 'vitest';
import { calculateRebaseReward } from 'utils/rebase-rewards.js';

describe('calculateRebaseReward', () => {
  it('should calculate positive rebase reward (no share change)', () => {
    const args = {
      shareRatePrev: 1000000000000000000000000000n, // 1.0 * 10^27
      shareRateCurr: 1100000000000000000000000000n, // 1.1 * 10^27
      sharesPrev: 100000000000000000000n, // 100 shares
    };

    const reward = calculateRebaseReward(args);

    // 100 * (1.1 - 1.0) = 100 * 0.1 = 10 ETH
    expect(reward).toBe(10000000000000000000n);
  });

  it('should calculate zero reward when share rate is unchanged', () => {
    const args = {
      shareRatePrev: 1000000000000000000000000000n,
      shareRateCurr: 1000000000000000000000000000n,
      sharesPrev: 100000000000000000000n,
    };

    const reward = calculateRebaseReward(args);
    expect(reward).toBe(0n);
  });

  it('should calculate negative reward (penalty / slashing)', () => {
    const args = {
      shareRatePrev: 1100000000000000000000000000n, // 1.1 * 10^27
      shareRateCurr: 1000000000000000000000000000n, // 1.0 * 10^27
      sharesPrev: 100000000000000000000n,
    };

    const reward = calculateRebaseReward(args);

    // 100 * (1.0 - 1.1) = 100 * -0.1 = -10 ETH
    expect(reward).toBe(-10000000000000000000n);
  });

  it('should use only opening shares when new stETH was minted mid-period', () => {
    // New shares minted mid-period are treated as arriving at the START of the
    // next period. Their rebase cost appears fully in the following period.
    // This mirrors how calculateLidoAPR uses preShareRate (opening value).
    const args = {
      shareRatePrev: 1000000000000000000000000000n,
      shareRateCurr: 1100000000000000000000000000n, // +10%
      sharesPrev: 100000000000000000000n, // 100 shares at start
      // sharesCurr would be 200 shares (doubled) but is not used
    };

    const reward = calculateRebaseReward(args);

    // 100 * (1.1 - 1.0) = 10 ETH  (minted shares ignored, cost deferred to next period)
    expect(reward).toBe(10000000000000000000n);
  });

  it('should use only opening shares when stETH was burned mid-period', () => {
    const args = {
      shareRatePrev: 1000000000000000000000000000n,
      shareRateCurr: 1200000000000000000000000000n, // +20%
      sharesPrev: 200000000000000000000n, // 200 shares at start
      // sharesCurr would be 100 shares (halved) but is not used
    };

    const reward = calculateRebaseReward(args);

    // 200 * (1.2 - 1.0) = 200 * 0.2 = 40 ETH
    expect(reward).toBe(40000000000000000000n);
  });

  it('should handle zero shares', () => {
    const args = {
      shareRatePrev: 1000000000000000000000000000n,
      shareRateCurr: 1100000000000000000000000000n,
      sharesPrev: 0n,
    };

    const reward = calculateRebaseReward(args);
    expect(reward).toBe(0n);
  });

  it('should handle small share rate increase', () => {
    const args = {
      shareRatePrev: 1000000000000000000000000000n,
      shareRateCurr: 1000000000000000000100000000n, // tiny increase
      sharesPrev: 100000000000000000000n,
    };

    const reward = calculateRebaseReward(args);

    expect(reward).toBeGreaterThan(0n);
    expect(reward).toBeLessThan(1000000000n); // less than 1 gwei
  });

  it('should handle large values', () => {
    const args = {
      shareRatePrev: 1500000000000000000000000000n, // 1.5 * 10^27
      shareRateCurr: 1600000000000000000000000000n, // 1.6 * 10^27
      sharesPrev: 10000000000000000000000n, // 10,000 ETH worth
    };

    const reward = calculateRebaseReward(args);

    // 10000 * (1.6 - 1.5) = 10000 * 0.1 = 1000 ETH
    expect(reward).toBe(1000000000000000000000n);
  });

  it('new shares have zero rebase cost in the mint period (deferred to next)', () => {
    // If sharesPrev = 0 (first period after a large deposit), rebase cost is 0
    // regardless of how many shares were minted. The full cost appears next period.
    const args = {
      shareRatePrev: 1000000000000000000000000000n,
      shareRateCurr: 1100000000000000000000000000n, // +10%
      sharesPrev: 0n, // no shares at start of period
    };

    const reward = calculateRebaseReward(args);

    expect(reward).toBe(0n);
  });

  it('should be consistent with calculateLidoAPR: both use opening value', () => {
    // calculateLidoAPR = ΔshareRate / preShareRate
    // rebaseCost       = sharesPrev × ΔshareRate / 1e27
    // Both denominate against the opening (prev) value, so vault APR and
    // Lido APR are directly comparable.
    const shareRatePrev = 1000000000000000000000000000n; // 1.0
    const shareRateCurr = 1030000000000000000000000000n; // 1.03 (+3%)
    const sharesPrev = 1000000000000000000000n; // 1000 shares

    const reward = calculateRebaseReward({
      shareRatePrev,
      shareRateCurr,
      sharesPrev,
    });

    // 1000 shares × 0.03 = 30 ETH rebase cost
    expect(reward).toBe(30000000000000000000n);
  });
});

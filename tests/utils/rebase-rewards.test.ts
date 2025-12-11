import { describe, it, expect } from 'vitest';
import { calculateRebaseReward } from 'utils/rebase-rewards.js';

describe('calculateRebaseReward', () => {
  it('should calculate positive rebase reward', () => {
    const args = {
      shareRatePrev: 1000000000000000000000000000n, // 1.0 * 10^27
      shareRateCurr: 1100000000000000000000000000n, // 1.1 * 10^27
      sharesPrev: 100000000000000000000n, // 100 shares (10^18 decimals)
      sharesCurr: 100000000000000000000n, // 100 shares
    };

    const reward = calculateRebaseReward(args);

    // Expected: (1.1 * 100 - 1.0 * 100) / 10^27 * 10^18 = 10 ETH
    expect(reward).toBe(10000000000000000000n);
  });

  it('should calculate zero reward when share rate is unchanged', () => {
    const args = {
      shareRatePrev: 1000000000000000000000000000n,
      shareRateCurr: 1000000000000000000000000000n,
      sharesPrev: 100000000000000000000n,
      sharesCurr: 100000000000000000000n,
    };

    const reward = calculateRebaseReward(args);
    expect(reward).toBe(0n);
  });

  it('should calculate negative reward (penalty)', () => {
    const args = {
      shareRatePrev: 1100000000000000000000000000n, // 1.1 * 10^27
      shareRateCurr: 1000000000000000000000000000n, // 1.0 * 10^27
      sharesPrev: 100000000000000000000n,
      sharesCurr: 100000000000000000000n,
    };

    const reward = calculateRebaseReward(args);

    // Expected: (1.0 * 100 - 1.1 * 100) / 10^27 * 10^18 = -10 ETH
    expect(reward).toBe(-10000000000000000000n);
  });

  it('should handle increased shares with same rate', () => {
    const args = {
      shareRatePrev: 1000000000000000000000000000n,
      shareRateCurr: 1000000000000000000000000000n,
      sharesPrev: 100000000000000000000n,
      sharesCurr: 200000000000000000000n, // doubled shares
    };

    const reward = calculateRebaseReward(args);

    // Expected: (1.0 * 200 - 1.0 * 100) / 10^27 * 10^18 = 100 ETH
    expect(reward).toBe(100000000000000000000n);
  });

  it('should handle decreased shares with same rate', () => {
    const args = {
      shareRatePrev: 1000000000000000000000000000n,
      shareRateCurr: 1000000000000000000000000000n,
      sharesPrev: 200000000000000000000n,
      sharesCurr: 100000000000000000000n, // halved shares
    };

    const reward = calculateRebaseReward(args);

    // Expected: (1.0 * 100 - 1.0 * 200) / 10^27 * 10^18 = -100 ETH
    expect(reward).toBe(-100000000000000000000n);
  });

  it('should handle zero shares', () => {
    const args = {
      shareRatePrev: 1000000000000000000000000000n,
      shareRateCurr: 1100000000000000000000000000n,
      sharesPrev: 0n,
      sharesCurr: 0n,
    };

    const reward = calculateRebaseReward(args);
    expect(reward).toBe(0n);
  });

  it('should handle small share rate increase', () => {
    const args = {
      shareRatePrev: 1000000000000000000000000000n,
      shareRateCurr: 1000000000000000000100000000n, // tiny increase
      sharesPrev: 100000000000000000000n,
      sharesCurr: 100000000000000000000n,
    };

    const reward = calculateRebaseReward(args);

    // Should be a small positive reward
    expect(reward).toBeGreaterThan(0n);
    expect(reward).toBeLessThan(1000000000n); // less than 1 gwei
  });

  it('should handle large values', () => {
    const args = {
      shareRatePrev: 1500000000000000000000000000n, // 1.5 * 10^27
      shareRateCurr: 1600000000000000000000000000n, // 1.6 * 10^27
      sharesPrev: 10000000000000000000000n, // 10,000 ETH worth of shares
      sharesCurr: 10000000000000000000000n,
    };

    const reward = calculateRebaseReward(args);

    // Expected: (1.6 * 10000 - 1.5 * 10000) / 10^27 * 10^18 = 1000 ETH
    expect(reward).toBe(1000000000000000000000n);
  });

  it('should calculate reward with both rate increase and share increase', () => {
    const args = {
      shareRatePrev: 1000000000000000000000000000n,
      shareRateCurr: 1100000000000000000000000000n,
      sharesPrev: 100000000000000000000n,
      sharesCurr: 200000000000000000000n,
    };

    const reward = calculateRebaseReward(args);

    // Expected: (1.1 * 200 - 1.0 * 100) / 10^27 * 10^18 = 120 ETH
    expect(reward).toBe(120000000000000000000n);
  });

  it('should calculate reward with rate increase and share decrease', () => {
    const args = {
      shareRatePrev: 1000000000000000000000000000n,
      shareRateCurr: 1200000000000000000000000000n,
      sharesPrev: 200000000000000000000n,
      sharesCurr: 100000000000000000000n,
    };

    const reward = calculateRebaseReward(args);

    // Expected: (1.2 * 100 - 1.0 * 200) / 10^27 * 10^18 = -80 ETH
    expect(reward).toBe(-80000000000000000000n);
  });
});

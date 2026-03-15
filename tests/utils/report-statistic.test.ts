import { describe, it, expect } from 'vitest';

import type { VaultReport } from 'utils/report/types.js';
import {
  calcAccruedFeeOffChain,
  calcNoEarnings,
  getNodeOperatorFeeForPeriod,
  getGrossStakingRewards,
  getDailyLidoFees,
  getNetStakingRewards,
  getGrossStakingAPR,
  getNetStakingAPR,
  getBottomLine,
  getCarrySpread,
  reportMetrics,
  type NOFeeSnapshot,
} from 'utils/statistic/report-statistic.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

const ETH = (n: number | bigint): bigint =>
  BigInt(n) * 1_000_000_000_000_000_000n; // n * 1e18

const ONE_YEAR_SECONDS = 31_536_000;

/** Minimal VaultReport fixture — override only the fields you care about. */
const makeReport = (
  opts: {
    totalValueWei?: bigint;
    fee?: bigint;
    liabilityShares?: bigint;
    inOutDelta?: bigint;
    timestamp?: number;
    blockNumber?: number;
  } = {},
): VaultReport => ({
  data: {
    vaultAddress: '0x0000000000000000000000000000000000000001',
    totalValueWei: String(opts.totalValueWei ?? 0n),
    fee: String(opts.fee ?? 0n),
    liabilityShares: String(opts.liabilityShares ?? 0n),
    maxLiabilityShares: '0',
    slashingReserve: '0',
  },
  extraData: {
    inOutDelta: String(opts.inOutDelta ?? 0n),
    prevFee: '0',
    infraFee: '0',
    liquidityFee: '0',
    reservationFee: '0',
  },
  leaf: '0x',
  refSlot: 0,
  blockNumber: opts.blockNumber ?? 1000,
  timestamp: opts.timestamp ?? 0,
  prevTreeCID: '',
  cid: '',
});

const makeSnapshot = (opts: Partial<NOFeeSnapshot> = {}): NOFeeSnapshot => ({
  accruedFee: 0n,
  settledGrowth: 0n,
  feeRate: 0n,
  ...opts,
});

// ─── calcAccruedFeeOffChain ──────────────────────────────────────────────────

describe('calcAccruedFeeOffChain', () => {
  it('calculates fee on positive unsettled growth', () => {
    // growth = 100 - 80 = 20 ETH; unsettled = 20 - 15 = 5 ETH; fee = 5 * 10% = 0.5 ETH
    const fee = calcAccruedFeeOffChain({
      totalValueWei: ETH(100),
      inOutDelta: ETH(80),
      settledGrowth: ETH(15),
      feeRate: 1000n, // 10%
    });
    expect(fee).toBe(ETH(1) / 2n); // 0.5 ETH
  });

  it('returns 0 when growth equals settledGrowth (fully settled)', () => {
    const fee = calcAccruedFeeOffChain({
      totalValueWei: ETH(120),
      inOutDelta: ETH(100),
      settledGrowth: ETH(20),
      feeRate: 1000n,
    });
    expect(fee).toBe(0n);
  });

  it('returns 0 when unsettledGrowth is negative', () => {
    // Vault lost value — no fee accrues
    const fee = calcAccruedFeeOffChain({
      totalValueWei: ETH(90),
      inOutDelta: ETH(100),
      settledGrowth: ETH(0),
      feeRate: 1000n,
    });
    expect(fee).toBe(0n);
  });

  it('returns 0 when feeRate is 0', () => {
    const fee = calcAccruedFeeOffChain({
      totalValueWei: ETH(110),
      inOutDelta: ETH(100),
      settledGrowth: ETH(0),
      feeRate: 0n,
    });
    expect(fee).toBe(0n);
  });

  it('is equivalent to on-chain formula: totalValueWei already includes quarantineValue', () => {
    // On-chain: growth = (VaultHub.totalValue + quarantineValue) - inOutDelta
    // IPFS:     totalValueWei = VaultHub.totalValue + quarantineValue
    // So the off-chain formula with totalValueWei produces the same result.
    const quarantineValue = ETH(5);
    const vaultHubTotalValue = ETH(95);
    const totalValueWei = vaultHubTotalValue + quarantineValue; // = 100 ETH (IPFS value)

    const feeOffChain = calcAccruedFeeOffChain({
      totalValueWei,
      inOutDelta: ETH(80),
      settledGrowth: ETH(0),
      feeRate: 1000n,
    });
    // growth = 100 - 80 = 20; fee = 20 * 10% = 2 ETH
    expect(feeOffChain).toBe(ETH(2));

    // Verify: same result using on-chain formula components explicitly
    const onChainGrowth = vaultHubTotalValue + quarantineValue - ETH(80);
    const onChainFee = (onChainGrowth * 1000n) / 10000n;
    expect(feeOffChain).toBe(onChainFee);
  });
});

// ─── calcNoEarnings ──────────────────────────────────────────────────────────

describe('calcNoEarnings', () => {
  it('sums settled portion and accrued portion', () => {
    // noEarnings = settledGrowth * feeRate / 10000 + accruedFee
    //            = 100 * 1000 / 10000 + 5 = 10 + 5 = 15 ETH
    const result = calcNoEarnings({
      settledGrowth: ETH(100),
      feeRate: 1000n,
      accruedFee: ETH(5),
    });
    expect(result).toBe(ETH(15));
  });

  it('returns only accruedFee when settledGrowth is 0', () => {
    const result = calcNoEarnings({
      settledGrowth: 0n,
      feeRate: 1000n,
      accruedFee: ETH(3),
    });
    expect(result).toBe(ETH(3));
  });

  it('handles negative settledGrowth (int128 can be negative)', () => {
    // Negative settledGrowth can occur transiently; noEarnings may be < accruedFee
    const result = calcNoEarnings({
      settledGrowth: -ETH(50),
      feeRate: 1000n, // 10%
      accruedFee: ETH(10),
    });
    // = -50 * 10% + 10 = -5 + 10 = 5 ETH
    expect(result).toBe(ETH(5));
  });

  it('returns 0 when all inputs are 0', () => {
    expect(
      calcNoEarnings({ settledGrowth: 0n, feeRate: 0n, accruedFee: 0n }),
    ).toBe(0n);
  });
});

// ─── getNodeOperatorFeeForPeriod ─────────────────────────────────────────────

describe('getNodeOperatorFeeForPeriod', () => {
  it('returns positive delta when noEarnings increased', () => {
    // prev noEarnings = 100*10% + 0 = 10 ETH
    // curr noEarnings = 110*10% + 2 = 13 ETH  → fee = 3 ETH
    const prev = makeSnapshot({
      settledGrowth: ETH(100),
      feeRate: 1000n,
      accruedFee: 0n,
    });
    const curr = makeSnapshot({
      settledGrowth: ETH(110),
      feeRate: 1000n,
      accruedFee: ETH(2),
    });
    expect(getNodeOperatorFeeForPeriod(curr, prev)).toBe(ETH(3));
  });

  it('returns 0 when delta is negative (e.g. feeRate decreased)', () => {
    // prev noEarnings = 100 * 10% + 0 = 10 ETH
    // curr noEarnings = 100 * 5% + 0 = 5 ETH  → delta = -5 → clamped to 0
    const prev = makeSnapshot({ settledGrowth: ETH(100), feeRate: 1000n });
    const curr = makeSnapshot({ settledGrowth: ETH(100), feeRate: 500n });
    expect(getNodeOperatorFeeForPeriod(curr, prev)).toBe(0n);
  });

  it('returns 0 when noEarnings is unchanged', () => {
    const snap = makeSnapshot({
      settledGrowth: ETH(100),
      feeRate: 1000n,
      accruedFee: ETH(5),
    });
    expect(getNodeOperatorFeeForPeriod(snap, snap)).toBe(0n);
  });

  it('is claim-timing invariant: same result whether NO claimed once or multiple times', () => {
    // After a claim: settledGrowth increases, accruedFee resets to 0.
    // noEarnings is the same before and after a claim, so delta is unaffected.
    const growth = ETH(200);
    const feeRate = 1000n; // 10%
    const expectedFee = (growth * feeRate) / 10000n; // 20 ETH earned total

    // Scenario A: no claim during period
    const prevA = makeSnapshot({
      settledGrowth: ETH(100),
      feeRate,
      accruedFee: ETH(0),
    });
    // noEarnings = 100*10% + 0 = 10 ETH
    const currA = makeSnapshot({
      settledGrowth: ETH(100),
      feeRate,
      accruedFee: ETH(20),
    });
    // noEarnings = 100*10% + 20 = 30 ETH → delta = 20 ETH

    // Scenario B: NO claimed mid-period (settledGrowth absorbed the accrual)
    const prevB = makeSnapshot({
      settledGrowth: ETH(100),
      feeRate,
      accruedFee: ETH(0),
    });
    const currB = makeSnapshot({
      settledGrowth: ETH(300),
      feeRate,
      accruedFee: ETH(0),
    });
    // noEarnings = 300*10% + 0 = 30 ETH → delta = 20 ETH

    expect(getNodeOperatorFeeForPeriod(currA, prevA)).toBe(expectedFee);
    expect(getNodeOperatorFeeForPeriod(currB, prevB)).toBe(expectedFee);
  });
});

// ─── getGrossStakingRewards ──────────────────────────────────────────────────

describe('getGrossStakingRewards', () => {
  it('returns organic TVL growth when there are no capital flows', () => {
    const prev = makeReport({
      totalValueWei: ETH(1000),
      inOutDelta: ETH(1000),
    });
    const curr = makeReport({
      totalValueWei: ETH(1003),
      inOutDelta: ETH(1000),
    });
    expect(getGrossStakingRewards(curr, prev)).toBe(ETH(3));
  });

  it('strips out a mid-period deposit from the reward', () => {
    // 100 ETH deposited mid-period; vault earns 3.5 ETH from staking
    const prev = makeReport({
      totalValueWei: ETH(1000),
      inOutDelta: ETH(1000),
    });
    const curr = makeReport({
      totalValueWei: ETH(1103) + ETH(1) / 2n,
      inOutDelta: ETH(1100),
    });
    // grossStakingRewards = (1103.5 - 1000) - (1100 - 1000) = 103.5 - 100 = 3.5 ETH
    expect(getGrossStakingRewards(curr, prev)).toBe(ETH(7) / 2n); // 3.5 ETH
  });

  it('returns negative value on slashing / value loss', () => {
    const prev = makeReport({
      totalValueWei: ETH(1000),
      inOutDelta: ETH(1000),
    });
    const curr = makeReport({ totalValueWei: ETH(997), inOutDelta: ETH(1000) });
    expect(getGrossStakingRewards(curr, prev)).toBe(-ETH(3));
  });

  it('returns 0 when value change is entirely explained by withdrawal', () => {
    // 8 ETH withdrawn; vault value drops by 8 ETH; no staking rewards
    const prev = makeReport({ totalValueWei: ETH(100), inOutDelta: ETH(100) });
    const curr = makeReport({ totalValueWei: ETH(92), inOutDelta: ETH(92) });
    expect(getGrossStakingRewards(curr, prev)).toBe(0n);
  });
});

// ─── getDailyLidoFees ────────────────────────────────────────────────────────

describe('getDailyLidoFees', () => {
  it('returns the increase in cumulative Lido fee balance', () => {
    const prev = makeReport({ fee: ETH(10) });
    const curr = makeReport({ fee: ETH(12) });
    expect(getDailyLidoFees(curr, prev)).toBe(ETH(2));
  });

  it('returns 0 when no fees were charged', () => {
    const report = makeReport({ fee: ETH(5) });
    expect(getDailyLidoFees(report, report)).toBe(0n);
  });
});

// ─── getNetStakingRewards ────────────────────────────────────────────────────

describe('getNetStakingRewards', () => {
  it('equals grossStakingRewards minus NO fee minus Lido fees', () => {
    const prev = makeReport({
      totalValueWei: ETH(1000),
      inOutDelta: ETH(1000),
      fee: ETH(10),
    });
    const curr = makeReport({
      totalValueWei: ETH(1050),
      inOutDelta: ETH(1000),
      fee: ETH(12),
    });
    // gross = 50 ETH
    const noFeePrev = makeSnapshot({
      settledGrowth: ETH(100),
      feeRate: 1000n,
      accruedFee: 0n,
    });
    const noFeeCurr = makeSnapshot({
      settledGrowth: ETH(100),
      feeRate: 1000n,
      accruedFee: ETH(5),
    });
    // noFee = 5 ETH; lidoFees = 2 ETH
    // net = 50 - 5 - 2 = 43 ETH

    const gross = getGrossStakingRewards(curr, prev);
    const noFee = getNodeOperatorFeeForPeriod(noFeeCurr, noFeePrev);
    const lido = getDailyLidoFees(curr, prev);
    const net = getNetStakingRewards(curr, prev, noFeeCurr, noFeePrev);

    expect(net).toBe(gross - noFee - lido);
    expect(net).toBe(ETH(43));
  });

  it('can be negative when fees exceed staking income', () => {
    const prev = makeReport({
      totalValueWei: ETH(100),
      inOutDelta: ETH(100),
      fee: ETH(0),
    });
    const curr = makeReport({
      totalValueWei: ETH(101),
      inOutDelta: ETH(100),
      fee: ETH(2),
    });
    // gross = 1 ETH, lidoFees = 2 ETH → net = -1 ETH
    const snap = makeSnapshot();
    const net = getNetStakingRewards(curr, prev, snap, snap);
    expect(net).toBe(-ETH(1));
  });
});

// ─── APR functions ───────────────────────────────────────────────────────────
//
// All three use the same annualization:
//   APR% = numerator * 100 * 31536000 / (previousTVL * periodSeconds)
//
// Using a 1-year period simplifies validation: APR% = numerator * 100 / previousTVL

describe('getGrossStakingAPR', () => {
  it('returns 5% APR for 50 ETH rewards on 1000 ETH TVL over one year', () => {
    const prev = makeReport({
      totalValueWei: ETH(1000),
      inOutDelta: ETH(1000),
      timestamp: 0,
    });
    const curr = makeReport({
      totalValueWei: ETH(1050),
      inOutDelta: ETH(1000),
      timestamp: ONE_YEAR_SECONDS,
    });

    const { apr, apr_bps, apr_percent } = getGrossStakingAPR(curr, prev);

    expect(apr).toBe(5n); // integer %
    expect(apr_bps).toBeCloseTo(500, 5); // 5.00 %
    expect(apr_percent).toBeCloseTo(5, 5);
  });

  it('returns negative APR when vault value dropped', () => {
    const prev = makeReport({
      totalValueWei: ETH(1000),
      inOutDelta: ETH(1000),
      timestamp: 0,
    });
    const curr = makeReport({
      totalValueWei: ETH(980),
      inOutDelta: ETH(1000),
      timestamp: ONE_YEAR_SECONDS,
    });

    const { apr_percent } = getGrossStakingAPR(curr, prev);
    expect(apr_percent).toBeCloseTo(-2, 5);
  });

  it('annualizes correctly for a 1-day period', () => {
    const ONE_DAY = 86_400;
    const dailyRewards = ETH(1000) / 365n; // ~2.74 ETH per day for 1000% annualized
    const prev = makeReport({
      totalValueWei: ETH(1000),
      inOutDelta: ETH(1000),
      timestamp: 0,
    });
    const curr = makeReport({
      totalValueWei: ETH(1000) + dailyRewards,
      inOutDelta: ETH(1000),
      timestamp: ONE_DAY,
    });

    const { apr_percent } = getGrossStakingAPR(curr, prev);
    // dailyRewards/TVL * 365 * 100 ≈ 100% APR (using integer division, slight truncation)
    expect(apr_percent).toBeGreaterThan(99);
    expect(apr_percent).toBeLessThanOrEqual(100);
  });
});

describe('getNetStakingAPR', () => {
  it('returns APR on net rewards (gross minus NO fee minus Lido fees)', () => {
    // gross = 50 ETH, noFee = 5 ETH, lidoFees = 2 ETH → net = 43 ETH → 4.3%
    const prev = makeReport({
      totalValueWei: ETH(1000),
      inOutDelta: ETH(1000),
      fee: ETH(10),
      timestamp: 0,
    });
    const curr = makeReport({
      totalValueWei: ETH(1050),
      inOutDelta: ETH(1000),
      fee: ETH(12),
      timestamp: ONE_YEAR_SECONDS,
    });
    const noFeePrev = makeSnapshot({
      settledGrowth: ETH(100),
      feeRate: 1000n,
      accruedFee: 0n,
    });
    const noFeeCurr = makeSnapshot({
      settledGrowth: ETH(100),
      feeRate: 1000n,
      accruedFee: ETH(5),
    });

    const { apr_percent } = getNetStakingAPR(curr, prev, noFeeCurr, noFeePrev);
    expect(apr_percent).toBeCloseTo(4.3, 5);
  });
});

describe('getCarrySpread', () => {
  it('returns APR on bottom line (net minus stETH liability rebase adjustment)', () => {
    // net = 43 ETH (from above), rebase adjustment = 10 ETH → bottomLine = 33 ETH → 3.3%
    const prev = makeReport({
      totalValueWei: ETH(1000),
      inOutDelta: ETH(1000),
      fee: ETH(10),
      timestamp: 0,
    });
    const curr = makeReport({
      totalValueWei: ETH(1050),
      inOutDelta: ETH(1000),
      fee: ETH(12),
      timestamp: ONE_YEAR_SECONDS,
    });
    const noFeePrev = makeSnapshot({
      settledGrowth: ETH(100),
      feeRate: 1000n,
      accruedFee: 0n,
    });
    const noFeeCurr = makeSnapshot({
      settledGrowth: ETH(100),
      feeRate: 1000n,
      accruedFee: ETH(5),
    });
    const stEthLiabilityRebaseAdjustment = ETH(10);

    const { apr_percent } = getCarrySpread(
      curr,
      prev,
      noFeeCurr,
      noFeePrev,
      stEthLiabilityRebaseAdjustment,
    );
    expect(apr_percent).toBeCloseTo(3.3, 5);
  });

  it('is negative when stETH liability growth exceeds net staking rewards', () => {
    // net = 3 ETH, rebase adjustment = 5 ETH → bottomLine = -2 ETH
    const prev = makeReport({
      totalValueWei: ETH(1000),
      inOutDelta: ETH(1000),
      timestamp: 0,
    });
    const curr = makeReport({
      totalValueWei: ETH(1003),
      inOutDelta: ETH(1000),
      timestamp: ONE_YEAR_SECONDS,
    });
    const snap = makeSnapshot();
    const { apr_percent } = getCarrySpread(curr, prev, snap, snap, ETH(5));
    expect(apr_percent).toBeCloseTo(-0.2, 5);
  });
});

// ─── getBottomLine ───────────────────────────────────────────────────────────

describe('getBottomLine', () => {
  it('equals netStakingRewards minus stETH liability rebase adjustment', () => {
    const prev = makeReport({
      totalValueWei: ETH(1000),
      inOutDelta: ETH(1000),
      fee: ETH(0),
    });
    const curr = makeReport({
      totalValueWei: ETH(1050),
      inOutDelta: ETH(1000),
      fee: ETH(2),
    });
    const snap = makeSnapshot();
    const rebaseAdjustment = ETH(10);

    const net = getNetStakingRewards(curr, prev, snap, snap);
    const bottomLine = getBottomLine(curr, prev, snap, snap, rebaseAdjustment);

    expect(bottomLine).toBe(net - rebaseAdjustment);
  });
});

// ─── reportMetrics ───────────────────────────────────────────────────────────

describe('reportMetrics', () => {
  it('aggregates all metrics consistently', () => {
    // 1-year period, 50 ETH gross, 5 ETH NO fee, 2 ETH Lido fees, 10 ETH rebase adjustment
    const prev = makeReport({
      totalValueWei: ETH(1000),
      inOutDelta: ETH(1000),
      fee: ETH(10),
      timestamp: 0,
    });
    const curr = makeReport({
      totalValueWei: ETH(1050),
      inOutDelta: ETH(1000),
      fee: ETH(12),
      timestamp: ONE_YEAR_SECONDS,
    });
    const noFeePrev = makeSnapshot({
      settledGrowth: ETH(100),
      feeRate: 1000n,
      accruedFee: 0n,
    });
    const noFeeCurr = makeSnapshot({
      settledGrowth: ETH(100),
      feeRate: 1000n,
      accruedFee: ETH(5),
    });
    const stEthLiabilityRebaseAdjustment = ETH(10);

    const metrics = reportMetrics({
      reports: { current: curr, previous: prev },
      noFeeCurr,
      noFeePrev,
      stEthLiabilityRebaseRewards: stEthLiabilityRebaseAdjustment,
    });

    expect(metrics.grossStakingRewards).toBe(ETH(50));
    expect(metrics.nodeOperatorRewards).toBe(ETH(5));
    expect(metrics.dailyLidoFees).toBe(ETH(2));
    expect(metrics.netStakingRewards).toBe(ETH(43));
    expect(metrics.bottomLine).toBe(ETH(33));

    expect(metrics.grossStakingAPR.apr_percent).toBeCloseTo(5, 5);
    expect(metrics.netStakingAPR.apr_percent).toBeCloseTo(4.3, 5);
    expect(metrics.carrySpread.apr_percent).toBeCloseTo(3.3, 5);

    // Internal consistency: netStakingRewards = grossStakingRewards - NO fee - Lido fees
    expect(metrics.netStakingRewards).toBe(
      metrics.grossStakingRewards -
        metrics.nodeOperatorRewards -
        metrics.dailyLidoFees,
    );

    // Internal consistency: bottomLine = netStakingRewards - rebase adjustment
    expect(metrics.bottomLine).toBe(
      metrics.netStakingRewards - stEthLiabilityRebaseAdjustment,
    );
  });
});

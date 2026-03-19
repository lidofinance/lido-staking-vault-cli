import type { VaultReport } from 'utils/report/types.js';

import { BASIS_POINTS_DENOMINATOR } from '../consts.js';

const SCALE = 1_000_000_000n; // 1e9 for 9 decimal places precision

// Snapshot of all NO fee data at a single oracle report block.
// accruedFee is computed off-chain from IPFS data (Variant 6) rather than
// read from Dashboard.accruedFee(), so it stays correct even when the vault
// owner hasn't applied the latest oracle report.
export type NOFeeSnapshot = {
  accruedFee: bigint; // computed off-chain via calcAccruedFeeOffChain
  settledGrowth: bigint; // int128 on-chain, can be negative
  feeRate: bigint; // basis points (e.g. 1000 = 10%)
};

export const EMPTY_NO_FEE_SNAPSHOT: NOFeeSnapshot = {
  accruedFee: 0n,
  settledGrowth: 0n,
  feeRate: 0n,
};

// Off-chain replica of NodeOperatorFee._calculateFee().
// Uses IPFS totalValueWei and inOutDelta so the result is correct regardless
// of whether the vault owner has called updateVaultData on-chain.
// IPFS totalValueWei is the oracle-observed value before the LazyOracle applies
// any quarantine deduction to VaultHub, i.e. totalValueWei = VaultHub.totalValue
// + quarantineValue. The off-chain formula is therefore mathematically equivalent
// to the on-chain accruedFee() without a separate quarantineValue term.
export const calcAccruedFeeOffChain = (params: {
  totalValueWei: bigint;
  inOutDelta: bigint;
  settledGrowth: bigint;
  feeRate: bigint;
}): bigint => {
  const { totalValueWei, inOutDelta, settledGrowth, feeRate } = params;
  const growth = totalValueWei - inOutDelta;
  const unsettledGrowth = growth - settledGrowth;
  if (unsettledGrowth <= 0n) return 0n;
  return (unsettledGrowth * feeRate) / BASIS_POINTS_DENOMINATOR;
};

// noEarnings(T) = settledGrowth(T) * feeRate(T) / 10000 + accruedFee(T)
//
// Its delta over a period equals grossStakingRewards * feeRate regardless of
// how many times the NO claimed fees during that period.
export const calcNoEarnings = (snapshot: NOFeeSnapshot): bigint => {
  return (
    (snapshot.settledGrowth * snapshot.feeRate) / BASIS_POINTS_DENOMINATOR +
    snapshot.accruedFee
  );
};

export const getNodeOperatorFeeForPeriod = (
  curr: NOFeeSnapshot,
  prev: NOFeeSnapshot,
): bigint => {
  const delta = calcNoEarnings(curr) - calcNoEarnings(prev);
  return delta > 0n ? delta : 0n;
};

export const getGrossStakingRewards = (
  current: VaultReport,
  previous: VaultReport,
) => {
  const totalCurr = BigInt(current.data.totalValueWei);
  const totalPrev = BigInt(previous.data.totalValueWei);

  return (
    totalCurr -
    totalPrev -
    (BigInt(current.extraData.inOutDelta) -
      BigInt(previous.extraData.inOutDelta))
  );
};

/** @deprecated */
export const getNodeOperatorRewards = (
  current: VaultReport,
  previous: VaultReport,
  nodeOperatorFeeBP: bigint,
) => {
  const grossStakingRewards = getGrossStakingRewards(current, previous);

  return (grossStakingRewards * nodeOperatorFeeBP) / BASIS_POINTS_DENOMINATOR;
};

export const getDailyLidoFees = (
  current: VaultReport,
  previous: VaultReport,
) => {
  return BigInt(current.data.fee) - BigInt(previous.data.fee);
};

export const getNetStakingRewards = (
  current: VaultReport,
  previous: VaultReport,
  noFeeCurr: NOFeeSnapshot,
  noFeePrev: NOFeeSnapshot,
) => {
  const grossStakingRewards = getGrossStakingRewards(current, previous);
  const dailyLidoFees = getDailyLidoFees(current, previous);
  const noFee = getNodeOperatorFeeForPeriod(noFeeCurr, noFeePrev);

  return grossStakingRewards - noFee - dailyLidoFees;
};

// The APR metrics (Gross Staking APR, Net Staking APR, Carry Spread) are calculated using the following general formula:
//
// APR = (Numerator * 100 * SecondsInYear) / (AverageTotalValue * PeriodSeconds)
//
// where:
//   Numerator — the specific rewards or value for the metric:
//     - For Gross Staking APR: grossStakingRewards
//     - For Net Staking APR: netStakingRewards
//     - For Carry Spread: bottomLine
//   PreviousTotalValue — TVL at the start of the period (opening value).
//
//     Using the opening TVL mirrors how calculateLidoAPR uses preShareRate,
//     keeping vault APR metrics directly comparable to Lido APR:
//       lidoAPR     = ΔshareRate / preShareRate * annualization
//       vaultAPR    = rewards    / previousTVL  * annualization
//
//     Note: in periods where a large deposit arrives mid-period the denominator
//     is still the pre-deposit TVL, which produces a one-off spike in the APR
//     metrics for that single period. This is expected and consistent with how
//     a simple-return methodology handles intra-period capital events.
//
//   PeriodSeconds — difference between end and start timestamps (in seconds)
//   SecondsInYear = 31536000
//
// Example for Gross Staking APR:
//   grossStakingAPR = (grossStakingRewards * 100 * 31536000) / (previousTotalValue * periodSeconds)
const getPreviousTotalValue = (previous: VaultReport) => {
  return BigInt(previous.data.totalValueWei);
};

const getPeriodSeconds = (current: VaultReport, previous: VaultReport) => {
  return current.timestamp - previous.timestamp;
};

export const getGrossStakingAPR = (
  current: VaultReport,
  previous: VaultReport,
) => {
  const grossStakingRewards = getGrossStakingRewards(current, previous);
  const previousTotalValue = getPreviousTotalValue(previous);
  const periodSeconds = getPeriodSeconds(current, previous);

  const apr_bigint =
    (grossStakingRewards * 10000n * 31536000n * SCALE) /
    (previousTotalValue * BigInt(periodSeconds));

  const apr =
    (grossStakingRewards * 100n * 31536000n) /
    (previousTotalValue * BigInt(periodSeconds));
  const apr_bps = Number(apr_bigint) / Number(SCALE);
  const apr_percent = apr_bps / 100;

  return {
    apr,
    apr_bps,
    apr_percent,
  };
};

export const getNetStakingAPR = (
  current: VaultReport,
  previous: VaultReport,
  noFeeCurr: NOFeeSnapshot,
  noFeePrev: NOFeeSnapshot,
) => {
  const periodSeconds = getPeriodSeconds(current, previous);
  const previousTotalValue = getPreviousTotalValue(previous);
  const netStakingRewards = getNetStakingRewards(
    current,
    previous,
    noFeeCurr,
    noFeePrev,
  );

  const apr_bigint =
    (netStakingRewards * 10000n * 31536000n * SCALE) /
    (previousTotalValue * BigInt(periodSeconds));

  const apr =
    (netStakingRewards * 100n * 31536000n) /
    (previousTotalValue * BigInt(periodSeconds));
  const apr_bps = Number(apr_bigint) / Number(SCALE);
  const apr_percent = apr_bps / 100;

  return {
    apr,
    apr_bps,
    apr_percent,
  };
};

export const getBottomLine = (
  current: VaultReport,
  previous: VaultReport,
  noFeeCurr: NOFeeSnapshot,
  noFeePrev: NOFeeSnapshot,
  stEthLiabilityRebaseRewards: bigint,
) => {
  const netStakingRewards = getNetStakingRewards(
    current,
    previous,
    noFeeCurr,
    noFeePrev,
  );

  return netStakingRewards - stEthLiabilityRebaseRewards;
};

export const getCarrySpread = (
  current: VaultReport,
  previous: VaultReport,
  noFeeCurr: NOFeeSnapshot,
  noFeePrev: NOFeeSnapshot,
  stEthLiabilityRebaseRewards: bigint,
) => {
  const previousTotalValue = getPreviousTotalValue(previous);
  const periodSeconds = getPeriodSeconds(current, previous);
  const bottomLine = getBottomLine(
    current,
    previous,
    noFeeCurr,
    noFeePrev,
    stEthLiabilityRebaseRewards,
  );

  const apr_bigint =
    (bottomLine * 10000n * 31536000n * SCALE) /
    (previousTotalValue * BigInt(periodSeconds));

  const apr =
    (bottomLine * 100n * 31536000n) /
    (previousTotalValue * BigInt(periodSeconds));
  const apr_bps = Number(apr_bigint) / Number(SCALE);
  const apr_percent = apr_bps / 100;

  return {
    apr,
    apr_bps,
    apr_percent,
  };
};

export type ReportMetricsArgs = {
  reports: { current: VaultReport; previous: VaultReport };
  noFeeCurr: NOFeeSnapshot;
  noFeePrev: NOFeeSnapshot;
  stEthLiabilityRebaseRewards: bigint;
};

export const reportMetrics = (args: ReportMetricsArgs) => {
  const { reports, noFeeCurr, noFeePrev, stEthLiabilityRebaseRewards } = args;
  const { current, previous } = reports;

  const grossStakingRewards = getGrossStakingRewards(current, previous);
  const nodeOperatorRewards = getNodeOperatorFeeForPeriod(noFeeCurr, noFeePrev);
  const dailyLidoFees = getDailyLidoFees(current, previous);
  const netStakingRewards = getNetStakingRewards(
    current,
    previous,
    noFeeCurr,
    noFeePrev,
  );
  const grossStakingAPR = getGrossStakingAPR(current, previous);
  const netStakingAPR = getNetStakingAPR(
    current,
    previous,
    noFeeCurr,
    noFeePrev,
  );
  const bottomLine = getBottomLine(
    current,
    previous,
    noFeeCurr,
    noFeePrev,
    stEthLiabilityRebaseRewards,
  );
  const carrySpread = getCarrySpread(
    current,
    previous,
    noFeeCurr,
    noFeePrev,
    stEthLiabilityRebaseRewards,
  );

  return {
    grossStakingRewards,
    nodeOperatorRewards,
    dailyLidoFees,
    netStakingRewards,
    grossStakingAPR,
    netStakingAPR,
    bottomLine,
    carrySpread,
  };
};

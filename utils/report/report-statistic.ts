import { BASIS_POINTS_DENOMINATOR, VaultReport } from 'utils';

const SCALE = 1_000_000_000n; // 1e9 for 9 decimal places precision

export const getGrossStakingRewards = (
  current: VaultReport,
  previous: VaultReport,
) => {
  const grossStakingRewards =
    BigInt(current.data.total_value_wei) -
    BigInt(previous.data.total_value_wei) -
    (BigInt(current.data.in_out_delta) - BigInt(previous.data.in_out_delta));

  return grossStakingRewards;
};

export const getNodeOperatorRewards = (
  grossStakingRewards: bigint,
  nodeOperatorFeeBP: bigint,
) => {
  return (grossStakingRewards * nodeOperatorFeeBP) / BASIS_POINTS_DENOMINATOR;
};

// TODO: get Lido Fees from the contract
export const getDailyLidoFees = () => {
  const prev_cumulativeLidoFees = 0n;
  const current_cumulativeLidoFees = 0n;

  return current_cumulativeLidoFees - prev_cumulativeLidoFees;
};

export const getNetStakingRewards = (
  current: VaultReport,
  previous: VaultReport,
  nodeOperatorFeeBP: bigint,
) => {
  const grossStakingRewards = getGrossStakingRewards(current, previous);
  const nodeOperatorRewards = getNodeOperatorRewards(
    grossStakingRewards,
    nodeOperatorFeeBP,
  );
  const dailyLidoFees = getDailyLidoFees();

  return grossStakingRewards - nodeOperatorRewards - dailyLidoFees;
};

// The APR metrics (Gross Staking APR, Net Staking APR, Efficiency) are calculated using the following general formula:
//
// APR = (Numerator * 100 * SecondsInYear) / (AverageTotalValue * PeriodSeconds)
//
// where:
//   Numerator — the specific rewards or value for the metric:
//     - For Gross Staking APR: grossStakingRewards
//     - For Net Staking APR: netStakingRewards
//     - For Efficiency: bottomLine
//   AverageTotalValue — arithmetic mean of TVL at the start and end of the period
//   PeriodSeconds — difference between end and start timestamps (in seconds)
//   SecondsInYear = 31536000
//
// Calculation steps:
// 1. Calculate the numerator for the metric (see above)
// 2. Divide by the average TVL
// 3. Multiply by 100 and the number of seconds in a year (31536000)
// 4. Divide by the period duration in seconds
//
// Example for Gross Staking APR:
//   grossStakingAPR = (grossStakingRewards * 100 * 31536000) / (averageTotalValue * periodSeconds)
const getAverageTotalValue = (current: VaultReport, previous: VaultReport) => {
  return (
    (BigInt(current.data.total_value_wei) +
      BigInt(previous.data.total_value_wei)) /
    2n
  );
};

const getPeriodSeconds = (current: VaultReport, previous: VaultReport) => {
  return current.timestamp - previous.timestamp;
};

export const getGrossStakingAPR = (
  current: VaultReport,
  previous: VaultReport,
) => {
  const grossStakingRewards = getGrossStakingRewards(current, previous);
  const averageTotalValue = getAverageTotalValue(current, previous);
  const periodSeconds = getPeriodSeconds(current, previous);

  const apr_bigint =
    (grossStakingRewards * 10000n * 31536000n * SCALE) /
    (averageTotalValue * BigInt(periodSeconds));

  const apr =
    (grossStakingRewards * 100n * 31536000n) /
    (averageTotalValue * BigInt(periodSeconds));
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
  nodeOperatorFeeBP: bigint,
) => {
  const averageTotalValue = getAverageTotalValue(current, previous);
  const periodSeconds = getPeriodSeconds(current, previous);

  const netStakingRewards = getNetStakingRewards(
    current,
    previous,
    nodeOperatorFeeBP,
  );

  const apr_bigint =
    (netStakingRewards * 10000n * 31536000n * SCALE) /
    (averageTotalValue * BigInt(periodSeconds));

  const apr =
    (netStakingRewards * 100n * 31536000n) /
    (averageTotalValue * BigInt(periodSeconds));
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
  nodeOperatorFeeBP: bigint,
  stEthLiabilityRebaseRewards: bigint,
) => {
  const netStakingRewards = getNetStakingRewards(
    current,
    previous,
    nodeOperatorFeeBP,
  );
  return netStakingRewards - stEthLiabilityRebaseRewards;
};

export const getEfficiency = (
  current: VaultReport,
  previous: VaultReport,
  nodeOperatorFeeBP: bigint,
  stEthLiabilityRebaseRewards: bigint,
) => {
  const averageTotalValue = getAverageTotalValue(current, previous);
  const periodSeconds = getPeriodSeconds(current, previous);
  const bottomLine = getBottomLine(
    current,
    previous,
    nodeOperatorFeeBP,
    stEthLiabilityRebaseRewards,
  );

  const apr_bigint =
    (bottomLine * 10000n * 31536000n * SCALE) /
    (averageTotalValue * BigInt(periodSeconds));

  const apr =
    (bottomLine * 100n * 31536000n) /
    (averageTotalValue * BigInt(periodSeconds));
  const apr_bps = Number(apr_bigint) / Number(SCALE);
  const apr_percent = apr_bps / 100;

  return {
    apr,
    apr_bps,
    apr_percent,
  };
};

type ReportMetricsArgs = {
  reports: { current: VaultReport; previous: VaultReport };
  nodeOperatorFeeBP: bigint;
  stEthLiabilityRebaseRewards: bigint;
};

export const reportMetrics = (args: ReportMetricsArgs) => {
  const { reports, nodeOperatorFeeBP, stEthLiabilityRebaseRewards } = args;
  const { current, previous } = reports;

  const grossStakingRewards = getGrossStakingRewards(current, previous);
  const nodeOperatorRewards = getNodeOperatorRewards(
    grossStakingRewards,
    nodeOperatorFeeBP,
  );
  const dailyLidoFees = getDailyLidoFees();
  const netStakingRewards = getNetStakingRewards(
    current,
    previous,
    nodeOperatorFeeBP,
  );

  const grossStakingAPR = getGrossStakingAPR(current, previous);
  const netStakingAPR = getNetStakingAPR(current, previous, nodeOperatorFeeBP);
  const bottomLine = getBottomLine(
    current,
    previous,
    nodeOperatorFeeBP,
    stEthLiabilityRebaseRewards,
  );
  const efficiency = getEfficiency(
    current,
    previous,
    nodeOperatorFeeBP,
    stEthLiabilityRebaseRewards,
  );

  // For UI: convert to float percent (divide by SCALE, then by 100)
  const grossStakingAPR_bps = grossStakingAPR.apr_bps;
  const netStakingAPR_bps = netStakingAPR.apr_bps;
  const efficiency_bps = efficiency.apr_bps;

  const grossStakingAPR_percent = grossStakingAPR.apr_percent;
  const netStakingAPR_percent = netStakingAPR.apr_percent;
  const efficiency_percent = efficiency.apr_percent;

  return {
    grossStakingRewards,
    nodeOperatorRewards,
    dailyLidoFees,
    netStakingRewards,
    grossStakingAPR,
    netStakingAPR,
    bottomLine,
    efficiency,
    grossStakingAPR_bps,
    netStakingAPR_bps,
    efficiency_bps,
    grossStakingAPR_percent,
    netStakingAPR_percent,
    efficiency_percent,
  };
};

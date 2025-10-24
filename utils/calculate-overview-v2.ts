import { calculateHealth } from './health/calculate-health.js';

type OverviewArgs = {
  totalValue: bigint;
  reserveRatioBP: number;
  liabilitySharesInStethWei: bigint;
  forcedRebalanceThresholdBP: number;
  withdrawableEther: bigint;
  balance: bigint;
  locked: bigint;
  nodeOperatorAccruedFee: bigint;
  totalMintingCapacityStethWei: bigint;
  unsettledLidoFees: bigint;
  minimalReserve: bigint;
  lastReportLiabilityInStethWei: bigint;
};

const BASIS_POINTS = 10_000n;

const bigIntMax = (...args: bigint[]) => args.reduce((a, b) => (a > b ? a : b));
const bigIntMin = (...args: bigint[]) => args.reduce((a, b) => (a < b ? a : b));

/**
 * Performs division with rounding up (ceiling division) for bigint values
 * @param numerator - The dividend
 * @param denominator - The divisor
 * @returns The result of division rounded up
 */
const ceilDiv = (numerator: bigint, denominator: bigint): bigint => {
  const result = numerator / denominator;
  return numerator % denominator === 0n ? result : result + 1n;
};

export const calculateOverviewV2 = (args: OverviewArgs) => {
  const {
    totalValue,
    reserveRatioBP,
    liabilitySharesInStethWei,
    forcedRebalanceThresholdBP,
    withdrawableEther,
    balance,
    locked,
    nodeOperatorAccruedFee,
    totalMintingCapacityStethWei,
    unsettledLidoFees,
    minimalReserve,
    lastReportLiabilityInStethWei,
  } = args;

  const { healthRatio, isHealthy } = calculateHealth({
    totalValue,
    liabilitySharesInStethWei,
    forcedRebalanceThresholdBP,
  });
  const availableToWithdrawal = withdrawableEther;
  const idleCapital = balance;
  const totalLocked = locked + nodeOperatorAccruedFee + unsettledLidoFees;
  const RR = BigInt(reserveRatioBP);
  const oneMinusRR = BASIS_POINTS - RR;
  const liabilityDivOneMinusRR =
    oneMinusRR === 0n
      ? 0n
      : ceilDiv(liabilitySharesInStethWei * BASIS_POINTS, oneMinusRR);

  const collateral = bigIntMax(minimalReserve, liabilityDivOneMinusRR);
  const recentlyRepaid = bigIntMax(
    lastReportLiabilityInStethWei - liabilitySharesInStethWei,
    0n,
  );

  const reservedByFormula =
    oneMinusRR === 0n
      ? 0n
      : ceilDiv(liabilitySharesInStethWei * BASIS_POINTS, oneMinusRR) -
        liabilitySharesInStethWei;
  const reserved = bigIntMin(
    totalValue - liabilitySharesInStethWei,
    reservedByFormula,
  );

  // Prevent division by 0
  const utilizationRatio =
    totalMintingCapacityStethWei === 0n
      ? 0
      : Number(
          ((liabilitySharesInStethWei * BASIS_POINTS) /
            totalMintingCapacityStethWei) *
            100n,
        ) / Number(BASIS_POINTS);

  return {
    healthRatio,
    isHealthy,
    availableToWithdrawal,
    idleCapital,
    totalLocked,
    collateral,
    recentlyRepaid,
    utilizationRatio,
    reserved,
    totalMintingCapacityStethWei,
  };
};

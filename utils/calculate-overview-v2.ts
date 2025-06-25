import { parseEther } from 'viem';

import { calculateHealth } from './health/calculate-health.js';

type OverviewArgs = {
  totalValue: bigint;
  reserveRatioBP: number;
  liabilitySharesInStethWei: bigint;
  forceRebalanceThresholdBP: number;
  withdrawableEther: bigint;
  balance: bigint;
  locked: bigint;
  nodeOperatorDisbursableFee: bigint;
  totalMintingCapacityStethWei: bigint;
  unsettledLidoFees: bigint;
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
    forceRebalanceThresholdBP,
    withdrawableEther,
    balance,
    locked,
    nodeOperatorDisbursableFee,
    totalMintingCapacityStethWei,
    unsettledLidoFees,
  } = args;

  const { healthRatio, isHealthy } = calculateHealth({
    totalValue,
    liabilitySharesInStethWei,
    forceRebalanceThresholdBP,
  });
  const availableToWithdrawal = withdrawableEther;
  const idleCapital = balance;
  const totalLocked = locked + nodeOperatorDisbursableFee + unsettledLidoFees;
  const RR = BigInt(reserveRatioBP);
  const oneMinusRR = BASIS_POINTS - RR;
  const liabilityDivOneMinusRR =
    oneMinusRR === 0n
      ? 0n
      : ceilDiv(liabilitySharesInStethWei * BASIS_POINTS, oneMinusRR);

  const collateral = bigIntMax(parseEther('1'), liabilityDivOneMinusRR);
  const recentlyRepaid =
    liabilityDivOneMinusRR <= parseEther('1')
      ? bigIntMax(locked - parseEther('1'), 0n)
      : bigIntMax(locked - liabilityDivOneMinusRR, 0n);

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

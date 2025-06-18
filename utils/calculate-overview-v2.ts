import { parseEther } from 'viem';

import { calculateHealth } from './health/calculate-health.js';

type OverviewArgs = {
  totalValue: bigint;
  reserveRatioBP: number;
  liabilitySharesInStethWei: bigint;
  liabilitySharesInWei: bigint;
  forceRebalanceThresholdBP: number;
  withdrawableEther: bigint;
  balance: bigint;
  locked: bigint;
  nodeOperatorDisbursableFee: bigint;
  totalMintingCapacityStethWei: bigint;
  totalMintingCapacitySharesInWei: bigint;
};

const BASIS_POINTS_DENOMINATOR = 10_000n;
const DECIMALS = 18n;
const SCALING_FACTOR = 10n ** DECIMALS;

const bigIntMax = (...args: bigint[]) => args.reduce((a, b) => (a > b ? a : b));
const bigIntMin = (...args: bigint[]) => args.reduce((a, b) => (a < b ? a : b));

export const calculateOverviewV2 = (args: OverviewArgs) => {
  const {
    totalValue,
    reserveRatioBP,
    liabilitySharesInStethWei,
    liabilitySharesInWei,
    forceRebalanceThresholdBP,
    withdrawableEther,
    balance,
    locked,
    nodeOperatorDisbursableFee,
    totalMintingCapacityStethWei,
    totalMintingCapacitySharesInWei,
  } = args;

  const { healthRatio, isHealthy } = calculateHealth({
    totalValue,
    liabilitySharesInStethWei,
    forceRebalanceThresholdBP,
  });
  const AvailableToWithdrawal = withdrawableEther;
  const idleCapital = balance;
  const UnsettledLidoFees = 0n;
  // TODO: add Lido Unclaimed Fees
  const totalLocked = locked + nodeOperatorDisbursableFee + UnsettledLidoFees;
  const RR =
    (BigInt(reserveRatioBP) * SCALING_FACTOR) / BASIS_POINTS_DENOMINATOR; // RR with SCALING_FACTOR
  const oneMinusRR = SCALING_FACTOR - RR; // (1 - RR) with SCALING_FACTOR
  const liabilityDivOneMinusRR =
    oneMinusRR === 0n
      ? 0n
      : (liabilitySharesInStethWei * SCALING_FACTOR) / oneMinusRR;

  const collateral = bigIntMax(parseEther('1'), liabilityDivOneMinusRR);
  const PendingUnlock =
    liabilityDivOneMinusRR <= parseEther('1')
      ? bigIntMax(locked - parseEther('1'), 0n)
      : bigIntMax(locked - liabilityDivOneMinusRR, 0n);
  const remainingMintingCapacityShares =
    totalMintingCapacitySharesInWei - liabilitySharesInWei;
  const remainingMintingCapacitySteth =
    totalMintingCapacityStethWei - liabilitySharesInStethWei;

  const reservedByFormula =
    oneMinusRR === 0n
      ? 0n
      : (liabilitySharesInStethWei * SCALING_FACTOR) / oneMinusRR -
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
          ((liabilitySharesInStethWei * SCALING_FACTOR) /
            totalMintingCapacityStethWei) *
            100n,
        ) / Number(SCALING_FACTOR);

  return {
    healthRatio,
    isHealthy,
    AvailableToWithdrawal,
    idleCapital,
    totalLocked,
    collateral,
    PendingUnlock,
    utilizationRatio,
    reserved,
    totalMintingCapacityStethWei,
    remainingMintingCapacitySteth,
    remainingMintingCapacityShares,
  };
};

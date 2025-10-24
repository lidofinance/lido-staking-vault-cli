import { parseEther } from 'viem';

import { calculateHealth } from './health/calculate-health.js';
import { BASIS_POINTS_DENOMINATOR, SCALING_FACTOR } from './consts.js';

type OverviewArgs = {
  totalValue: bigint;
  reserveRatioBP: number;
  liabilitySharesInStethWei: bigint;
  forcedRebalanceThresholdBP: number;
  withdrawableEther: bigint;
  balance: bigint;
  locked: bigint;
  nodeOperatorUnclaimedFee: bigint;
  totalMintingCapacityStethWei: bigint;
};

const bigIntMax = (...args: bigint[]) => args.reduce((a, b) => (a > b ? a : b));
const bigIntMin = (...args: bigint[]) => args.reduce((a, b) => (a < b ? a : b));
// Percent helper (basis points → percentage)
export const formatBP = (bp: number | bigint) =>
  `${((Number(bp) / Number(BASIS_POINTS_DENOMINATOR)) * 100).toFixed(2)}%`;
export const formatRatio = (r: number) =>
  isFinite(r) ? `${r.toFixed(4)}%` : '∞';

export const calculateOverview = (args: OverviewArgs) => {
  const {
    totalValue,
    reserveRatioBP,
    liabilitySharesInStethWei,
    forcedRebalanceThresholdBP,
    withdrawableEther,
    balance,
    locked,
    nodeOperatorUnclaimedFee,
    totalMintingCapacityStethWei,
  } = args;

  const { healthRatio, isHealthy } = calculateHealth({
    totalValue,
    liabilitySharesInStethWei,
    forcedRebalanceThresholdBP,
  });
  const AvailableToWithdrawal = withdrawableEther;
  const idleCapital = balance;
  // TODO: add Lido Unclaimed Fees
  const totalLocked = locked + nodeOperatorUnclaimedFee;

  // ---------- Computed values ---------- //
  const totalReservable =
    (totalValue * BigInt(reserveRatioBP)) / BASIS_POINTS_DENOMINATOR;

  // Prevent division by 0
  const utilizationRatio =
    totalMintingCapacityStethWei === 0n
      ? 0
      : Number(
          ((liabilitySharesInStethWei * SCALING_FACTOR) /
            totalMintingCapacityStethWei) *
            100n,
        ) / Number(SCALING_FACTOR);

  const reservedRaw =
    totalMintingCapacityStethWei === 0n
      ? 0n
      : (liabilitySharesInStethWei * totalReservable * SCALING_FACTOR) /
        totalMintingCapacityStethWei;
  const reserved = bigIntMax(
    bigIntMax(
      reservedRaw / SCALING_FACTOR,
      totalValue - liabilitySharesInStethWei,
    ),
    0n,
  );

  const collateral = bigIntMin(
    bigIntMax(liabilitySharesInStethWei + reserved, parseEther('1')),
    totalValue,
  );
  const PendingUnlock =
    locked - nodeOperatorUnclaimedFee - liabilitySharesInStethWei - reserved <
    parseEther('1')
      ? 0n
      : locked -
        nodeOperatorUnclaimedFee -
        liabilitySharesInStethWei -
        reserved;
  const remainingMintingCapacity =
    totalMintingCapacityStethWei - liabilitySharesInStethWei;

  return {
    healthRatio,
    isHealthy,
    AvailableToWithdrawal,
    idleCapital,
    totalLocked,
    collateral,
    PendingUnlock,
    utilizationRatio,
    totalReservable,
    reserved,
    totalMintingCapacityStethWei,
    remainingMintingCapacity,
  };
};

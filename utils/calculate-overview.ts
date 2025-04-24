import { parseEther } from 'viem';
import { calculateHealth } from './health/calculate-health.js';

export const BASIS_POINTS_DENOMINATOR = 10_000n;
const DECIMALS = 18n;
const SCALING_FACTOR = 10n ** DECIMALS;

const bigIntMax = (...args: bigint[]) => args.reduce((a, b) => (a > b ? a : b));
const bigIntMin = (...args: bigint[]) => args.reduce((a, b) => (a < b ? a : b));
// Percent helper (basis points → percentage)
export const formatBP = (bp: number | bigint) =>
  `${((Number(bp) / Number(BASIS_POINTS_DENOMINATOR)) * 100).toFixed(2)}%`;
export const formatRatio = (r: number) =>
  isFinite(r) ? `${r.toFixed(4)}%` : '∞';

export const calculateOverview = (
  totalValue: bigint,
  reserveRatioBP: number,
  liabilitySharesInStethWei: bigint,
  forceRebalanceThresholdBP: number,
  withdrawableEther: bigint,
  balance: bigint,
  locked: bigint,
  nodeOperatorUnclaimedFee: bigint,
  totalMintingCapacity: bigint,
) => {
  const { healthRatio, isHealthy } = calculateHealth(
    totalValue,
    liabilitySharesInStethWei,
    forceRebalanceThresholdBP,
  );
  const AvailableToWithdrawal = withdrawableEther;
  const idleCapital = balance;
  const depositedToValidators = totalValue - balance;
  const totalLocked = locked + nodeOperatorUnclaimedFee;
  const lockedByAccumulatedFees = nodeOperatorUnclaimedFee;

  // ---------- Computed values ---------- //
  const totalReservable =
    (totalValue * BigInt(reserveRatioBP)) / BASIS_POINTS_DENOMINATOR;

  // Prevent division by 0
  const stethMintingCapacityUsed =
    totalMintingCapacity === 0n
      ? 0n
      : (liabilitySharesInStethWei * SCALING_FACTOR) / totalMintingCapacity;

  const reservedRaw =
    totalMintingCapacity === 0n
      ? 0n
      : (liabilitySharesInStethWei * totalReservable * SCALING_FACTOR) /
        totalMintingCapacity;
  const reserved = bigIntMax(
    bigIntMin(
      reservedRaw / SCALING_FACTOR,
      totalValue - liabilitySharesInStethWei,
    ),
    0n,
  );

  const collateral = bigIntMax(
    liabilitySharesInStethWei + reserved,
    parseEther('1'),
  );
  const PendingUnlock = totalLocked - liabilitySharesInStethWei - reserved;
  // Ratio helper
  const utilizationRatio =
    liabilitySharesInStethWei === 0n
      ? Infinity
      : (Number(
          (liabilitySharesInStethWei * SCALING_FACTOR) /
            (totalValue * (BASIS_POINTS_DENOMINATOR - BigInt(reserveRatioBP))),
        ) /
          Number(SCALING_FACTOR)) *
        10_000;

  return {
    healthRatio,
    isHealthy,
    AvailableToWithdrawal,
    idleCapital,
    depositedToValidators,
    totalLocked,
    lockedByAccumulatedFees,
    collateral,
    PendingUnlock,
    utilizationRatio,
    totalReservable,
    reserved,
    stethMintingCapacityUsed:
      (Number(stethMintingCapacityUsed) / Number(SCALING_FACTOR)) * 100,
    totalMintingCapacity,
  };
};

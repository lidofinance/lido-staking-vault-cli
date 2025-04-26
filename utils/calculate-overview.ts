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
  nodeOperatorUnclaimedFee: bigint;
  totalMintingCapacity: bigint;
};

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

export const calculateOverview = (args: OverviewArgs) => {
  const {
    totalValue,
    reserveRatioBP,
    liabilitySharesInStethWei,
    forceRebalanceThresholdBP,
    withdrawableEther,
    balance,
    locked,
    nodeOperatorUnclaimedFee,
    totalMintingCapacity,
  } = args;

  const { healthRatio, isHealthy } = calculateHealth({
    totalValue,
    liabilitySharesInStethWei,
    forceRebalanceThresholdBP,
  });
  const AvailableToWithdrawal = withdrawableEther;
  const idleCapital = balance;
  const totalLocked = locked + nodeOperatorUnclaimedFee;

  // ---------- Computed values ---------- //
  const totalReservable =
    (totalValue * BigInt(reserveRatioBP)) / BASIS_POINTS_DENOMINATOR;

  // Prevent division by 0
  const utilizationRatio =
    totalMintingCapacity === 0n
      ? 0
      : Number(
          ((liabilitySharesInStethWei * SCALING_FACTOR) /
            totalMintingCapacity) *
            100n,
        ) / Number(SCALING_FACTOR);

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
    totalMintingCapacity,
  };
};

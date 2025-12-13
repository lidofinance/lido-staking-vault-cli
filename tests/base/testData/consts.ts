export type TierParams = {
  shareLimit: bigint;
  reserveRatioBP: bigint;
  forcedRebalanceThresholdBP: bigint;
  infraFeeBP: bigint;
  liquidityFeeBP: bigint;
  reservationFeeBP: bigint;
};

export const DEFAULT_TIER_ID = 0;

export const DEFAULT_TIER_PARAMS: TierParams = {
  shareLimit: BigInt('100000000000000000000000'),
  reserveRatioBP: BigInt('5000'),
  forcedRebalanceThresholdBP: BigInt('4950'),
  infraFeeBP: BigInt('100'),
  liquidityFeeBP: BigInt('650'),
  reservationFeeBP: BigInt('0'),
};

export const LIDO_CONNECTION_COLLATERAL = '1';

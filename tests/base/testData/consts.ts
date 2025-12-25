import { getStandConfig } from '../config';

export type TierParams = {
  shareLimit: bigint;
  reserveRatioBP: bigint;
  forcedRebalanceThresholdBP: bigint;
  infraFeeBP: bigint;
  liquidityFeeBP: bigint;
  reservationFeeBP: bigint;
};

export const DEFAULT_TIER_ID = 0;

const getShareLimitForChain = (): bigint => {
  // Hoodi (chainId: 560048) -> 100000000000000000000000
  // Mainnet (chainId: 1) -> 0
  const chainId = getStandConfig().networkConfig.chainId;
  if (chainId === 560048) {
    return BigInt('100000000000000000000000');
  } else if (chainId === 1) {
    return BigInt('0');
  }
  throw new Error(`Unsupported chainId: ${chainId}`);
};

export const DEFAULT_TIER_PARAMS: TierParams = {
  shareLimit: getShareLimitForChain(),
  reserveRatioBP: BigInt('5000'),
  forcedRebalanceThresholdBP: BigInt('4975'),
  infraFeeBP: BigInt('100'),
  liquidityFeeBP: BigInt('650'),
  reservationFeeBP: BigInt('0'),
};

export const LIDO_CONNECTION_COLLATERAL = '1';

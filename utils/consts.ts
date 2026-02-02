import { hoodi, mainnet } from 'viem/chains';

export const BASIS_POINTS_DENOMINATOR = 10_000n;
export const DECIMALS = 18n;
export const SCALING_FACTOR = 10n ** DECIMALS;

export const V3_START_BLOCKS: Record<number, bigint> = {
  [mainnet.id]: 24054276n,
  [hoodi.id]: 1372809n,
};

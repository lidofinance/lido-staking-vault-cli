import { Address } from "viem";

export interface JSONConfig {
  rpcLink: string | undefined;
  privateKey: string | undefined;
  chainId: number | undefined;
  lidoLocator: Address | undefined;
  accounting: Address | undefined;
  tokenManager: Address | undefined;
  voting: Address | undefined;
}

export type Vote = readonly [boolean, boolean, bigint, bigint, bigint, bigint, bigint, bigint, bigint, `0x${string}`, number];

import { Chain } from "viem";

export interface JSONConfig {
  rpcLink: string | undefined;
  privateKey: string | undefined;
  chainId: Chain | undefined;
  lidoLocator: string | undefined;
  accounting: string | undefined;
}

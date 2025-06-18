import {
  getContract,
  createPublicClient,
  http,
  GetContractReturnType,
  WalletClient,
} from 'viem';

import { LazyOracleAbi } from 'abi/index.js';
import { getChain, getElUrl } from 'configs';
import { getLocatorContract } from 'contracts';

export const getLazyOracleContract = async (): Promise<
  GetContractReturnType<typeof LazyOracleAbi, WalletClient>
> => {
  const elUrl = getElUrl();
  const locator = getLocatorContract();
  const address = await locator.read.lazyOracle();

  return getContract({
    address,
    abi: LazyOracleAbi,
    client: createPublicClient({
      chain: getChain(),
      transport: http(elUrl),
    }),
  });
};

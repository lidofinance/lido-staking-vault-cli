import {
  getContract,
  createPublicClient,
  http,
  PublicClient,
  GetContractReturnType,
} from 'viem';
import { WstEthAbi } from 'abi/index.js';
import { getChain, getElUrl } from 'configs';
import { getLocatorContract } from 'contracts';

export const getWstethContract = async (): Promise<
  GetContractReturnType<typeof WstEthAbi, PublicClient>
> => {
  const locator = await getLocatorContract();
  const elUrl = getElUrl();
  const chain = await getChain();
  const address = await locator.read.wstETH();

  return getContract({
    address: address,
    abi: WstEthAbi,
    client: createPublicClient({
      chain,
      transport: http(elUrl),
    }),
  });
};

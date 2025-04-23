import { getContract, createPublicClient, http } from 'viem';
import { WstEthAbi } from 'abi/index.js';
import { getChain, getElUrl } from 'configs';
import { getLocatorContract } from 'contracts';

export const getWstethContract = async () => {
  const locator = getLocatorContract();
  const elUrl = getElUrl();
  const address = await locator.read.wstETH();

  return getContract({
    address: address,
    abi: WstEthAbi,
    client: createPublicClient({
      chain: getChain(),
      transport: http(elUrl),
    }),
  });
};

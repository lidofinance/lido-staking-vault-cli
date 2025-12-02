import { getContract, createPublicClient, http } from 'viem';
import { StEthAbi } from 'abi/index.js';
import { getChain, getElUrl } from 'configs';
import { getLocatorContract } from 'contracts';

export const getStethContract = async () => {
  const locator = await getLocatorContract();
  const elUrl = getElUrl();
  const chain = await getChain();
  const address = await locator.read.lido();

  return getContract({
    address: address,
    abi: StEthAbi,
    client: createPublicClient({
      chain,
      transport: http(elUrl),
    }),
  });
};

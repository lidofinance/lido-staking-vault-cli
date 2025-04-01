import { getContract, createPublicClient, http } from 'viem';
import { StEthAbi } from 'abi/index.js';
import { getChain, getRpcUrl } from 'configs';
import { getLocatorContract } from 'contracts';

export const getStethContract = async () => {
  const locator = getLocatorContract();
  const rpcUrl = getRpcUrl();
  const address = await locator.read.lido();

  return getContract({
    address: address,
    abi: StEthAbi,
    client: createPublicClient({
      chain: getChain(),
      transport: http(rpcUrl),
    }),
  });
};

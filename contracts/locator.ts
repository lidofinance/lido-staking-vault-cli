import { getContract, createPublicClient, http } from 'viem';
import { LidoLocatorAbi } from 'abi';
import { getChain, getLocatorAddress, getRpcUrl } from 'configs';

export const getLocatorContract = () => {
  const rpcUrl = getRpcUrl();
  const address = getLocatorAddress();

  return getContract({
    address,
    abi: LidoLocatorAbi,
    client: createPublicClient({
      chain: getChain(),
      transport: http(rpcUrl),
    }),
  });
};

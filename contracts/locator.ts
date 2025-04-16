import { getContract, createPublicClient, http } from 'viem';
import { LidoLocatorAbi } from 'abi';
import { getChain, getLocatorAddress, getElUrl } from 'configs';

export const getLocatorContract = () => {
  const elUrl = getElUrl();
  const address = getLocatorAddress();

  return getContract({
    address,
    abi: LidoLocatorAbi,
    client: createPublicClient({
      chain: getChain(),
      transport: http(elUrl),
    }),
  });
};

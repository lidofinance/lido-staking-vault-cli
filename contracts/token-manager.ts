import { getContract, createPublicClient, http } from 'viem';
import { tokenManagerAbi } from 'abi/index.js';
import { getChain, getElUrl, getTokenMasterAddress } from 'configs';

export const getTokenManagerContract = () => {
  const elUrl = getElUrl();
  const address = getTokenMasterAddress();

  return getContract({
    address,
    abi: tokenManagerAbi,
    client: createPublicClient({
      chain: getChain(),
      transport: http(elUrl),
    }),
  });
};

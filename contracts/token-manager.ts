import { getContract, createPublicClient, http } from 'viem';
import { tokenManagerAbi } from 'abi/index.js';
import { getChain, getRpcUrl, getTokenMasterAddress } from 'configs';

export const getTokenManagerContract = () => {
  const rpcUrl = getRpcUrl();
  const address = getTokenMasterAddress();

  return getContract({
    address,
    abi: tokenManagerAbi,
    client: createPublicClient({
      chain: getChain(),
      transport: http(rpcUrl),
    }),
  });
};

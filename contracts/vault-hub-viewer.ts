import { getContract, createPublicClient, http, Address } from 'viem';
import { VaultHubViewerAbi } from 'abi/index.js';
import { getChain, getRpcUrl } from 'configs';

export const getVaultHubViewerContract = (address: Address) => {
  return getContract({
    address,
    abi: VaultHubViewerAbi,
    client: createPublicClient({
      chain: getChain(),
      transport: http(getRpcUrl()),
    }),
  });
};

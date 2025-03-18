import { getContract, createPublicClient, http, Address } from 'viem';
import { mainnet, sepolia, holesky } from 'viem/chains';

import { VaultViewerAbi } from 'abi';
import { getChain, getRpcUrl } from 'configs';

const VaultViewerAddresses: Record<number, Address> = {
  [mainnet.id]: '0x',
  [sepolia.id]: '0xF124672D263BB6e7A5B5cbcF8e6F39b4F6cbe582',
  [holesky.id]: '0x5D73Eec220C7428eEAa26aF0F6d65B4dD1bb95aA',
};

export const getVaultViewerContract = () => {
  const chainId = getChain().id;
  const address = VaultViewerAddresses[chainId];

  if (!address) {
    throw new Error(`VaultViewer contract not found for chain ${chainId}`);
  }

  return getContract({
    address,
    abi: VaultViewerAbi,
    client: createPublicClient({
      chain: getChain(),
      transport: http(getRpcUrl()),
    }),
  });
};

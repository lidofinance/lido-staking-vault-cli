import { getContract, createPublicClient, http, Address } from 'viem';
import { hoodi } from 'viem/chains';

import { VaultViewerAbi } from 'abi';
import { getChain, getElUrl } from 'configs';

const VaultViewerAddresses: Record<number, Address> = {
  [hoodi.id]: '0x7155ef6c1487442AB62B2b1c2A87956D3d2dBa36',
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
      transport: http(getElUrl()),
    }),
  });
};

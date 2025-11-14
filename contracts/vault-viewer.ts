import { getContract, createPublicClient, http, Address } from 'viem';
import { hoodi } from 'viem/chains';

import { VaultViewerAbi } from 'abi';
import { getChain, getElUrl } from 'configs';

const VaultViewerAddresses: Record<number, Address> = {
  [hoodi.id]: '0x510b4CE9CdA8E5C9268D242a51356fF9Dc2bd73b',
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

import { getContract, createPublicClient, http, Address } from 'viem';
import { hoodi } from 'viem/chains';

import { VaultViewerAbi } from 'abi';
import { getChain, getElUrl } from 'configs';

const VaultViewerAddresses: Record<number, Address> = {
  [hoodi.id]: '0x9E90338495FfD691bDDC680e47D94b60cF66dDad',
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

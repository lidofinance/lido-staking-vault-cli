import {
  getContract,
  createPublicClient,
  http,
  Address,
  PublicClient,
  GetContractReturnType,
} from 'viem';
import { mainnet } from 'viem/chains';

import { hoodi } from 'viem/chains';

import { VaultViewerAbi } from 'abi';
import { getChain, getElUrl } from 'configs';

const VaultViewerAddresses: Record<number, Address> = {
  [hoodi.id]: '0x510b4CE9CdA8E5C9268D242a51356fF9Dc2bd73b',
  [mainnet.id]: '0x9E90338495FfD691bDDC680e47D94b60cF66dDad', // TODO: update to the redeployed address
};

export const getVaultViewerContract = async (): Promise<
  GetContractReturnType<typeof VaultViewerAbi, PublicClient>
> => {
  const chain = await getChain();
  const address = VaultViewerAddresses[chain.id];

  if (!address) {
    throw new Error(`VaultViewer contract not found for chain ${chain.id}`);
  }

  return getContract({
    address,
    abi: VaultViewerAbi,
    client: createPublicClient({
      chain,
      transport: http(getElUrl()),
    }),
  });
};

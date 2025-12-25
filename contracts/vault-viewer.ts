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
  [hoodi.id]: '0xEAfD3F8DC0ABA14B81344ea0B869DdF9F7e18221',
  [mainnet.id]: '0x93DaaEa5D290Da9a7A6A65fe4F6C1D3ebb44E0e1',
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

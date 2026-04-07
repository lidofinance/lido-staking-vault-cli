import { getContract, Address, GetContractReturnType } from 'viem';
import { mainnet, hoodi } from 'viem/chains';

import { VaultViewerAbi } from 'abi';
import { getPublicClient, RegisteredPublicClient } from 'providers/index.js';

const VaultViewerAddresses: Record<number, Address> = {
  [hoodi.id]: '0xEAfD3F8DC0ABA14B81344ea0B869DdF9F7e18221',
  [mainnet.id]: '0x93DaaEa5D290Da9a7A6A65fe4F6C1D3ebb44E0e1',
};

export type VaultViewerContract = GetContractReturnType<
  typeof VaultViewerAbi,
  RegisteredPublicClient
>;

export const getVaultViewerContract =
  async (): Promise<VaultViewerContract> => {
    const publicClient = await getPublicClient();
    const address = VaultViewerAddresses[publicClient.chain.id];

    if (!address) {
      throw new Error(
        `VaultViewer contract not found for chain ${publicClient.chain.id}`,
      );
    }

    return getContract({
      address,
      abi: VaultViewerAbi,
      client: publicClient,
    });
  };

import {
  getContract,
  createPublicClient,
  http,
  GetContractReturnType,
  WalletClient,
  Address,
} from 'viem';
import { VaultHubAbi } from 'abi/index.js';
import { getChain, getElUrl } from 'configs';
import { getLocatorContract } from 'contracts';

export type VaultConnection = {
  vaultIndex: bigint;
  owner: Address;
  pendingDisconnect: boolean;
};

export const getVaultHubContract = async (): Promise<
  GetContractReturnType<typeof VaultHubAbi, WalletClient>
> => {
  const elUrl = getElUrl();
  const locator = getLocatorContract();
  const address = await locator.read.vaultHub();

  return getContract({
    address,
    abi: VaultHubAbi,
    client: createPublicClient({
      chain: getChain(),
      transport: http(elUrl),
    }),
  });
};

import { Address, getContract, GetContractReturnType } from 'viem';
import { VaultFactoryAbi } from 'abi/index.js';
import { getLocatorContract } from 'contracts/locator.js';
import { getPublicClient, RegisteredPublicClient } from 'providers/index.js';

export type VaultFactoryContract = GetContractReturnType<
  typeof VaultFactoryAbi,
  RegisteredPublicClient
>;

let vaultFactoryAddressCache: Promise<Address> | undefined;

// The Locator address is fixed per run, so read it once
const getVaultFactoryAddress = (): Promise<Address> => {
  vaultFactoryAddressCache ??= (async () => {
    const locator = await getLocatorContract();

    return locator.read.vaultFactory();
  })().catch((error: unknown) => {
    vaultFactoryAddressCache = undefined;
    throw error;
  });

  return vaultFactoryAddressCache;
};

export const getVaultFactoryContract =
  async (): Promise<VaultFactoryContract> => {
    const publicClient = await getPublicClient();
    const address = await getVaultFactoryAddress();

    return getContract({
      address,
      abi: VaultFactoryAbi,
      client: publicClient,
    });
  };

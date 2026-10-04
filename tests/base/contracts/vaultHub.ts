import { getLocatorContract } from './lidoLocator';
import {
  Address,
  getContract,
  GetContractReturnType,
  PublicClient,
} from 'viem';
import { VaultHubAbi } from '../../../abi';
import { callReadMethodSilent, getClient } from '../providers';

export const getVaultHubContract = async (): Promise<
  GetContractReturnType<typeof VaultHubAbi, PublicClient>
> => {
  const locator = await getLocatorContract();
  const address = await locator.read.vaultHub();
  return getContract({
    address: address,
    abi: VaultHubAbi,
    client: getClient(),
  });
};

export const isVaultConnected = async (vaultAddress: Address) => {
  const contract = await getVaultHubContract();
  return await callReadMethodSilent(contract, 'isVaultConnected', [
    vaultAddress,
  ]);
};

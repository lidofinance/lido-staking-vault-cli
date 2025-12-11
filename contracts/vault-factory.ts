import {
  getContract,
  createPublicClient,
  http,
  GetContractReturnType,
  PublicClient,
} from 'viem';
import { VaultFactoryAbi } from 'abi/index.js';
import { getDeployedAddress, getElUrl, getChain } from 'configs';

export const getVaultFactoryContract = async (): Promise<
  GetContractReturnType<typeof VaultFactoryAbi, PublicClient>
> => {
  const chain = await getChain();

  return getContract({
    address: getDeployedAddress('stakingVaultFactory'),
    abi: VaultFactoryAbi,
    client: createPublicClient({
      chain,
      transport: http(getElUrl()),
    }),
  });
};

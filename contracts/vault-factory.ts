import { getContract, createPublicClient, http } from 'viem';
import { VaultFactoryAbi } from 'abi/index.js';
import { getDeployedAddress, getElUrl, getChain } from 'configs';

export const getVaultFactoryContract = () => {
  return getContract({
    address: getDeployedAddress('stakingVaultFactory') as `0x${string}`,
    abi: VaultFactoryAbi,
    client: createPublicClient({
      chain: getChain(),
      transport: http(getElUrl()),
    }),
  });
};

import { getContract, createPublicClient, http } from 'viem';
import { VaultFactoryAbi } from 'abi/index.js';
import { getDeployedAddress, getRpcUrl, getChain } from 'configs';

export const getVaultFactoryContract = () => {
  const rpcUrls = getRpcUrl();
  const url = rpcUrls.split(',')[0];

  const client = createPublicClient({
    chain: getChain(),
    transport: http(url),
  });

  const contract = getContract({
    address: getDeployedAddress('stakingVaultFactory'),
    abi: VaultFactoryAbi,
    client,
  });

  return { client, contract };
};

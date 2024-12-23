import { getContract, createPublicClient, http } from "viem";
import { VaultFactoryAbi } from "abi";
import { getDeployedAddress, envs, getRpcUrl, getChain } from "@configs";

export const getVaultFactoryContract = (chainId: number) => {
  const rpcUrls = getRpcUrl() ?? envs?.[`RPC_URL_${chainId}`];
  const url = rpcUrls.split(',')[0];

  return getContract({
    address: getDeployedAddress("stakingVaultFactory"),
    abi: VaultFactoryAbi,
    client: createPublicClient({
      chain: getChain(chainId),
      transport: http(url),
    }),
  });
};

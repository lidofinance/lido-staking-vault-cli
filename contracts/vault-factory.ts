import { getContract, createPublicClient, http, Chain } from "viem";
import { VaultFactoryAbi } from "abi";
import { getDeployedAddress, envs, getRpcUrl } from "@configs";

export const getVaultFactoryContract = (chain: Chain) => {
  const rpcUrls = getRpcUrl() ?? envs?.[`RPC_URL_${chain}`];
  const url = rpcUrls.split(',')[0];

  return getContract({
    address: getDeployedAddress("stakingVaultFactory"),
    abi: VaultFactoryAbi,
    client: createPublicClient({
      chain: chain,
      transport: http(url),
    }),
  });
};

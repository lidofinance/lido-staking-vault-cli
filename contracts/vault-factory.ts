import { getContract, createPublicClient, http, Chain } from "viem";
import { VaultFactoryAbi } from "abi";
import { getDeployedAddress, envs } from "@configs";

export const getVaultFactoryContract = (chainId?: Chain) => {
  const rpcUrl = envs?.[`RPC_URL_${chainId || process.env.CHAIN_ID}`];

  return getContract({
    address: getDeployedAddress("stakingVaultFactory"),
    abi: VaultFactoryAbi,
    client: createPublicClient({
      chain: chainId,
      transport: http(rpcUrl),
    }),
  });
};

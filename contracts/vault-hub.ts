import { getContract, createPublicClient, http } from "viem";
import { VaultHubAbi } from "abi";
import {getDeployedAddress, envs, getChain} from "@configs";

export const getVaultHubContract = (chainId?: number) => {
  const rpcUrl = envs?.[`RPC_URL_${chainId || process.env.CHAIN_ID}`];

  return getContract({
    address: getDeployedAddress("accounting"),
    abi: VaultHubAbi,
    client: createPublicClient({
      chain: getChain(chainId),
      transport: http(rpcUrl),
    }),
  });
};

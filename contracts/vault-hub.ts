import { getContract, createPublicClient, http, Chain } from "viem";
import { VaultHubAbi } from "abi/VaultHub";
import { getDeployedAddress, envs } from "@configs";

export const getVaultHubContract = (chainId?: Chain) => {
  const rpcUrl = envs?.[`RPC_URL_${chainId || process.env.CHAIN_ID}`];

  const vaultHubContract = getContract({
    address: getDeployedAddress("accounting"),
    abi: VaultHubAbi,
    client: createPublicClient({
      chain: chainId,
      transport: http(rpcUrl),
    }),
  });

  return vaultHubContract;
};

import { getContract, createPublicClient, http, Chain } from "viem";
import { VaultHubAbi } from "abi/VaultHub";
import { getDeployedAddress, envs } from "@configs";

export const getVaultHubContract = (chainId?: Chain) => {
  const currentChainId = chainId ?? process.env.CHAIN_ID;
  const rpcUrl = envs?.[`RPC_URL_${chainId || currentChainId}`];

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

import { getContract, createPublicClient, http, Chain, Address } from "viem";
import { StakingVaultAbi } from "abi";
import { envs } from "@configs";

export const getStakingVaultContract = (address: Address, chainId?: Chain) => {
  const rpcUrl = envs?.[`RPC_URL_${chainId || process.env.CHAIN_ID}`];

  const vaultHubContract = getContract({
    address,
    abi: StakingVaultAbi,
    client: createPublicClient({
      chain: chainId,
      transport: http(rpcUrl),
    }),
  });

  return vaultHubContract;
};

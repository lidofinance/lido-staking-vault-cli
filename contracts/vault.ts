import { getContract, createPublicClient, http, Address } from "viem";
import { StakingVaultAbi } from "abi";
import { getChain, getRpcUrl } from "@configs";

export const getStakingVaultContract = (address: Address) => {
  return getContract({
    address,
    abi: StakingVaultAbi,
    client: createPublicClient({
      chain: getChain(),
      transport: http(getRpcUrl()),
    }),
  });
};

import { getContract, createPublicClient, http, Address } from "viem";
import { DashboardAbi } from "abi";
import { getChain, getRpcUrl } from "@configs";

export const getDashboardContract = (address: Address) => {
  const rpcUrl = getRpcUrl();

  return getContract({
    address: address,
    abi: DashboardAbi,
    client: createPublicClient({
      chain: getChain(),
      transport: http(rpcUrl),
    }),
  });
};

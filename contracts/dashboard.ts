import { getContract, createPublicClient, http } from "viem";
import { DashboardAbi } from "abi";
import { getDeployedAddress, getChain, getRpcUrl } from "@configs";

export const getDashboardContract = () => {
  const rpcUrl = getRpcUrl();

  return getContract({
    address: getDeployedAddress("accounting"),
    abi: DashboardAbi,
    client: createPublicClient({
      chain: getChain(),
      transport: http(rpcUrl),
    }),
  });
};

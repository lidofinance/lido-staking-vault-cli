import { getContract, Address } from "viem";
import { DashboardAbi } from "abi";
import { getPublicClient } from "@providers";

export const getDashboardContract = (address: Address) => {
  return getContract({
    address: address,
    abi: DashboardAbi,
    client: getPublicClient(),
  });
};

export type DashboardContract = ReturnType<typeof getDashboardContract>;

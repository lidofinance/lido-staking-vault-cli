import { getContract, Address } from "viem";
import { DelegationAbi } from "abi";
import { getPublicClient } from "@providers";

export const getDelegationContract = (address: Address) => {
  return getContract({
    address: address,
    abi: DelegationAbi,
    client: getPublicClient(),
  });
};

export type DelegationContract = ReturnType<typeof getDelegationContract>;

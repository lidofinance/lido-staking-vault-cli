import { getContract, createPublicClient, http, Address } from "viem";
import { DelegationAbi } from "abi";
import { getChain, getRpcUrl } from "@configs";

export const getDelegationContract = (address: Address) => {
  const rpcUrl = getRpcUrl();

  return getContract({
    address: address,
    abi: DelegationAbi,
    client: createPublicClient({
      chain: getChain(),
      transport: http(rpcUrl),
    }),
  });
};

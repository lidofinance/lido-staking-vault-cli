import { getContract, createPublicClient, http, Address } from "viem";
import { lidoLocator } from "abi";
import { getChain, getConfig, getRpcUrl } from "@configs";

export const getLocatorContract = () => {
  const rpcUrl = getRpcUrl();
  const config = getConfig();

  return getContract({
    address: config.lidoLocator! as Address,
    abi: lidoLocator,
    client: createPublicClient({
      chain: getChain(),
      transport: http(rpcUrl),
    }),
  });
};

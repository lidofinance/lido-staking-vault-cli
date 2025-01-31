import { getContract, createPublicClient, http } from "viem";
import { StEthAbi } from "abi";
import { getDeployedAddress, getChain, getRpcUrl } from "@configs";

export const getStethContract = () => {
  const rpcUrl = getRpcUrl();

  return getContract({
    address: getDeployedAddress("eip712StETH"),
    abi: StEthAbi,
    client: createPublicClient({
      chain: getChain(),
      transport: http(rpcUrl),
    }),
  });
};

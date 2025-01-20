import { getContract, createPublicClient, http } from "viem";
import { VaultHubAbi } from "abi";
import { getChain, getRpcUrl } from "@configs";
import {getLocatorContract} from "./locator";

export const getVaultHubContract = async () => {
  const rpcUrl = getRpcUrl();
  const locator = getLocatorContract();
  const address = await locator.read.accountingOracle();

  return getContract({
    address,
    abi: VaultHubAbi,
    client: createPublicClient({
      chain: getChain(),
      transport: http(rpcUrl),
    }),
  });
};

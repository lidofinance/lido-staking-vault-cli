import { getContract, createPublicClient, http } from 'viem';
import { VaultHubAbi } from 'abi/index.js';
import { getChain, getRpcUrl } from 'configs';
import { getLocatorContract } from 'contracts';

export const getVaultHubContract = async () => {
  const rpcUrl = getRpcUrl();
  const locator = getLocatorContract();
  const address = await locator.read.vaultHub();

  return getContract({
    address,
    abi: VaultHubAbi,
    client: createPublicClient({
      chain: getChain(),
      transport: http(rpcUrl),
    }),
  });
};

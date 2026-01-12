import {
  getContract,
  createPublicClient,
  http,
  GetContractReturnType,
  WalletClient,
} from 'viem';
import { StEthAbi } from 'abi/index.js';
import { getChain, getElUrl } from 'configs';
import { getLocatorContract } from 'contracts';

export const getStethContract = async (): Promise<
  GetContractReturnType<typeof StEthAbi, WalletClient>
> => {
  const locator = await getLocatorContract();
  const elUrl = getElUrl();
  const chain = await getChain();
  const address = await locator.read.lido();

  return getContract({
    address,
    abi: StEthAbi,
    client: createPublicClient({
      chain,
      transport: http(elUrl),
    }),
  });
};

export type StethContract = Awaited<ReturnType<typeof getStethContract>>;

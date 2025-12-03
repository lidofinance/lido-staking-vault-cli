import {
  getContract,
  createPublicClient,
  http,
  GetContractReturnType,
  WalletClient,
} from 'viem';
import { OperatorGridAbi } from 'abi/index.js';
import { getChain, getElUrl } from 'configs';
import { getLocatorContract } from 'contracts';

export const getOperatorGridContract = async (): Promise<
  GetContractReturnType<typeof OperatorGridAbi, WalletClient>
> => {
  const locator = await getLocatorContract();
  const chain = await getChain();
  const address = await locator.read.operatorGrid();

  return getContract({
    address,
    abi: OperatorGridAbi,
    client: createPublicClient({
      chain,
      transport: http(getElUrl()),
    }),
  });
};

export type OperatorGridContract = Awaited<
  ReturnType<typeof getOperatorGridContract>
>;

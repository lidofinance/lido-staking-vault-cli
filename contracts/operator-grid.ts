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
  const locator = getLocatorContract();
  const address = await locator.read.operatorGrid();

  return getContract({
    address,
    abi: OperatorGridAbi,
    client: createPublicClient({
      chain: getChain(),
      transport: http(getElUrl()),
    }),
  });
};

export type OperatorGridContract = ReturnType<typeof getOperatorGridContract>;

import { getContract, GetContractReturnType } from 'viem';
import { OperatorGridAbi } from 'abi/index.js';
import { getLocatorContract } from 'contracts/locator.js';
import { getPublicClient, RegisteredPublicClient } from 'providers/index.js';

export const getOperatorGridContract =
  async (): Promise<OperatorGridContract> => {
    const locator = await getLocatorContract();
    const publicClient = await getPublicClient();
    const address = await locator.read.operatorGrid();

    return getContract({
      address,
      abi: OperatorGridAbi,
      client: publicClient,
    });
  };

export type OperatorGridContract = GetContractReturnType<
  typeof OperatorGridAbi,
  RegisteredPublicClient
>;

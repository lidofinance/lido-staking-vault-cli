import { getContract, Address, GetContractReturnType } from 'viem';
import { WithdrawalQueueAbi } from 'abi/defi-wrapper/index.js';
import { getPublicClient, RegisteredPublicClient } from 'providers';

export const getWithdrawalQueueContract = async (
  address: Address,
): Promise<WithdrawalQueueContract> => {
  const publicClient = await getPublicClient();

  return getContract({
    address: address,
    abi: WithdrawalQueueAbi,
    client: publicClient,
  });
};

export type WithdrawalQueueContract = GetContractReturnType<
  typeof WithdrawalQueueAbi,
  RegisteredPublicClient
>;

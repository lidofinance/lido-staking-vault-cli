import {
  getContract,
  Address,
  GetContractReturnType,
  WalletClient,
} from 'viem';
import { WithdrawalQueueAbi } from 'abi/defi-wrapper/index.js';
import { getPublicClient } from 'providers';

export const getWithdrawalQueueContract = async (
  address: Address,
): Promise<GetContractReturnType<typeof WithdrawalQueueAbi, WalletClient>> => {
  const publicClient = await getPublicClient();

  return getContract({
    address: address,
    abi: WithdrawalQueueAbi,
    client: publicClient,
  });
};

export type WithdrawalQueueContract = ReturnType<
  typeof getWithdrawalQueueContract
>;

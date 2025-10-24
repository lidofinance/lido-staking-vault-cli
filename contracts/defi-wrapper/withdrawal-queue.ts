import {
  getContract,
  Address,
  GetContractReturnType,
  WalletClient,
} from 'viem';
import { WithdrawalQueueAbi } from 'abi/defi-wrapper/index.js';
import { getPublicClient } from 'providers';

export const getWithdrawalQueueContract = (
  address: Address,
): GetContractReturnType<typeof WithdrawalQueueAbi, WalletClient> => {
  return getContract({
    address: address,
    abi: WithdrawalQueueAbi,
    client: getPublicClient(),
  });
};

export type WithdrawalQueueContract = ReturnType<
  typeof getWithdrawalQueueContract
>;

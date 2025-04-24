import {
  getContract,
  Address,
  GetContractReturnType,
  WalletClient,
} from 'viem';
import { StakingVaultAbi } from 'abi/index.js';
import { getPublicClient } from 'providers';

export const getStakingVaultContract = (
  address: Address,
): GetContractReturnType<typeof StakingVaultAbi, WalletClient> => {
  return getContract({
    address,
    abi: StakingVaultAbi,
    client: getPublicClient(),
  });
};

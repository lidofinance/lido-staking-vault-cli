import { getContract, GetContractReturnType, PublicClient } from 'viem';
import { getStandConfig } from '../../config';
import { getClient } from '../../providers';
import { dualGovernanceAbi } from '../abi';

export const getDualGovernanceContract = async (): Promise<
  GetContractReturnType<typeof dualGovernanceAbi, PublicClient>
> => {
  const contractAddress = getStandConfig().contracts.dualGovernanceContract;
  return getContract({
    address: contractAddress,
    abi: dualGovernanceAbi,
    client: getClient(),
  });
};

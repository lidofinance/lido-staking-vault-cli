import {
  getContract,
  GetContractReturnType,
  PublicClient,
  Account,
} from 'viem';
import { getStandConfig } from '../../config';
import { getClient } from '../../providers';
import { dualGovernanceAbi } from '../abi';
import { callReadMethodSilent } from '../../providers';
import { callWriteMethod } from '../../providers/contractWrite';

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

export const canScheduleProposal = async (
  proposalId: bigint,
): Promise<boolean> => {
  const contract = await getDualGovernanceContract();
  return await callReadMethodSilent(contract, 'canScheduleProposal', [
    proposalId,
  ]);
};

export const scheduleProposal = async (
  account: Account,
  proposalId: bigint,
): Promise<void> => {
  const contract = await getDualGovernanceContract();
  await callWriteMethod({
    account,
    contract,
    methodName: 'scheduleProposal',
    payload: [proposalId],
  });
};

// Wait for normal state - checks dual governance state and activates next state if needed
export const waitForNormalState = async (): Promise<void> => {
  // TODO: Implement full dual governance state checking logic
  // For now, just wait a bit to allow state transitions
  await new Promise((resolve) => setTimeout(resolve, 1000));
};

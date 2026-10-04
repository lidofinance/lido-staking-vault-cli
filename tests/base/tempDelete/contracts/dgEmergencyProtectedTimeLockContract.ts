import {
  getContract,
  GetContractReturnType,
  PublicClient,
  Account,
} from 'viem';
import { getStandConfig } from '../../config';
import { getClient } from '../../providers';
import { dgEmergencyProtectedTimeLockAbi } from '../abi';
import { callReadMethodSilent } from '../../providers';
import { callWriteMethod } from '../../providers/contractWrite';

export const dgEmergencyProtectedTimeLock = async (): Promise<
  GetContractReturnType<typeof dgEmergencyProtectedTimeLockAbi, PublicClient>
> => {
  const contractAddress =
    getStandConfig().contracts.dgEmergencyProtectedTimeLockContract;
  return getContract({
    address: contractAddress,
    abi: dgEmergencyProtectedTimeLockAbi,
    client: getClient(),
  });
};

// Proposal status enum values
export const PROPOSAL_STATUS = {
  not_exist: 0,
  submitted: 1,
  scheduled: 2,
  executed: 3,
  cancelled: 4,
} as const;

export type ProposalDetails = {
  id: bigint;
  executor: string;
  submittedAt: bigint;
  scheduledAt: bigint;
  status: number;
};

export const getProposalsCount = async (): Promise<bigint> => {
  const contract = await dgEmergencyProtectedTimeLock();
  const result = await callReadMethodSilent(contract, 'getProposalsCount');
  if (typeof result === 'bigint' || typeof result === 'number') {
    return BigInt(result);
  }
  return BigInt((result as any).count || result);
};

export const getProposalDetails = async (
  proposalId: bigint,
): Promise<ProposalDetails> => {
  const contract = await dgEmergencyProtectedTimeLock();
  const result = await callReadMethodSilent(contract, 'getProposalDetails', [
    proposalId,
  ]);

  let proposalDetails: {
    id: bigint;
    executor: string;
    submittedAt: bigint;
    scheduledAt: bigint;
    status: number;
  };

  if (Array.isArray(result)) {
    const firstElement = result[0] as {
      id: bigint;
      executor: string;
      submittedAt: bigint;
      scheduledAt: bigint;
      status: number;
    };
    proposalDetails = firstElement;
  } else if (
    result &&
    typeof result === 'object' &&
    'proposalDetails' in result
  ) {
    proposalDetails = (result as any).proposalDetails;
  } else {
    proposalDetails = result as any;
  }

  return {
    id: proposalDetails.id,
    executor: proposalDetails.executor,
    submittedAt: proposalDetails.submittedAt,
    scheduledAt: proposalDetails.scheduledAt,
    status: proposalDetails.status,
  };
};

export const getAfterSubmitDelay = async (): Promise<bigint> => {
  const contract = await dgEmergencyProtectedTimeLock();
  const result = await callReadMethodSilent(contract, 'getAfterSubmitDelay');
  return BigInt(result);
};

export const getAfterScheduleDelay = async (): Promise<bigint> => {
  const contract = await dgEmergencyProtectedTimeLock();
  const result = await callReadMethodSilent(contract, 'getAfterScheduleDelay');
  return BigInt(result);
};

export const getMinExecutionDelay = async (): Promise<bigint> => {
  const contract = await dgEmergencyProtectedTimeLock();
  const result = await callReadMethodSilent(contract, 'MIN_EXECUTION_DELAY');
  if (typeof result === 'bigint' || typeof result === 'number') {
    return BigInt(result);
  }
  return BigInt(result as any);
};

export const canExecute = async (proposalId: bigint): Promise<boolean> => {
  const contract = await dgEmergencyProtectedTimeLock();
  return await callReadMethodSilent(contract, 'canExecute', [proposalId]);
};

export const executeProposal = async (
  account: Account,
  proposalId: bigint,
): Promise<void> => {
  const contract = await dgEmergencyProtectedTimeLock();
  await callWriteMethod({
    account,
    contract,
    methodName: 'execute',
    payload: [proposalId],
  });
};

import {
  getContract,
  GetContractReturnType,
  PublicClient,
  Hex,
  Address,
} from 'viem';
import { getStandConfig } from '../../config';
import { callReadMethodSilent, getClient } from '../../providers';
import { aragonVotingAbi } from '../abi';
import { callWriteMethod } from '../../providers/contractWrite';
import type { Account } from 'viem';

export type VoteData = {
  open: boolean;
  executed: boolean;
  startDate: bigint;
  snapshotBlock: bigint;
  supportRequired: bigint;
  minAcceptQuorum: bigint;
  yea: bigint;
  nay: bigint;
  votingPower: bigint;
  script: Hex;
  phase: number;
};

export const getAragonVotingContract = async (): Promise<
  GetContractReturnType<typeof aragonVotingAbi, PublicClient>
> => {
  const contractAddress = getStandConfig().contracts.aragonVoting;
  return getContract({
    address: contractAddress,
    abi: aragonVotingAbi,
    client: getClient(),
  });
};

export const getVotesTotalAmount = async () => {
  const contract = await getAragonVotingContract();
  return await callReadMethodSilent(contract, 'votesLength');
};

export const getVote = async (voteId: any): Promise<VoteData> => {
  const contract = await getAragonVotingContract();
  const result = await callReadMethodSilent(contract, 'getVote', [voteId]);

  const [
    open,
    executed,
    startDate,
    snapshotBlock,
    supportRequired,
    minAcceptQuorum,
    yea,
    nay,
    votingPower,
    script,
    phase,
  ] = result as [
    boolean,
    boolean,
    bigint,
    bigint,
    bigint,
    bigint,
    bigint,
    bigint,
    bigint,
    Hex,
    number,
  ];

  return {
    open,
    executed,
    startDate,
    snapshotBlock,
    supportRequired,
    minAcceptQuorum,
    yea,
    nay,
    votingPower,
    script,
    phase,
  };
};

export const vote = async (
  account: Account,
  voteId: any,
  support: any,
  bool: any,
) => {
  const contract = await getAragonVotingContract();

  await callWriteMethod({
    account,
    contract,
    methodName: 'vote',
    payload: [voteId, support, bool],
  });
};

export const executeVote = async (account: Account, voteId: any) => {
  const contract = await getAragonVotingContract();

  await callWriteMethod({
    account,
    contract,
    methodName: 'executeVote',
    payload: [voteId],
  });
};

export const canExecuteVote = async (voteId: bigint): Promise<boolean> => {
  const contract = await getAragonVotingContract();
  return await callReadMethodSilent(contract, 'canExecute', [voteId]);
};

// Checks if address can vote on a specific vote
export const canVote = async (
  voteId: bigint,
  address: Address,
): Promise<boolean> => {
  const contract = await getAragonVotingContract();
  return await callReadMethodSilent(contract, 'canVote', [voteId, address]);
};

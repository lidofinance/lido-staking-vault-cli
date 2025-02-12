import { getContract, createPublicClient, http } from 'viem';
import { votingAbi } from 'abi/index.js';
import { getChain, getRpcUrl, getVotingAddress } from 'configs';

export const getVotingContract = () => {
  const rpcUrl = getRpcUrl();
  const address = getVotingAddress();
  const client = createPublicClient({
    chain: getChain(),
    transport: http(rpcUrl),
  });

  const contract = getContract({
    abi: votingAbi,
    address,
    client,
  });

  return { client, contract };
};

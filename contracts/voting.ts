import { getContract, createPublicClient, http } from 'viem';
import { votingAbi } from 'abi/index.js';
import { getChain, getElUrl, getVotingAddress } from 'configs';

export const getVotingContract = () => {
  const elUrl = getElUrl();
  const address = getVotingAddress();
  const client = createPublicClient({
    chain: getChain(),
    transport: http(elUrl),
  });

  const contract = getContract({
    abi: votingAbi,
    address,
    client,
  });

  return { client, contract };
};

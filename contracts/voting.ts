import {
  getContract,
  createPublicClient,
  http,
  GetContractReturnType,
  WalletClient,
  PublicClient,
} from 'viem';
import { votingAbi } from 'abi/index.js';
import { getChain, getElUrl, getVotingAddress } from 'configs';

export const getVotingContract = (): {
  contract: GetContractReturnType<typeof votingAbi, WalletClient>;
  client: PublicClient;
} => {
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

import {
  Address,
  getContract,
  GetContractReturnType,
  PublicClient,
} from 'viem';
import { getStandConfig } from '../../config';
import { callReadMethodSilent, getClient } from '../../providers';
import { ldoTokenAbi } from '../abi';

export const getLdoTokenContract = async (): Promise<
  GetContractReturnType<typeof ldoTokenAbi, PublicClient>
> => {
  const contractAddress = getStandConfig().contracts.ldoContract;
  return getContract({
    address: contractAddress,
    abi: ldoTokenAbi,
    client: getClient(),
  });
};

export const getLdoTokenBalance = async (address: Address) => {
  const contract = await getLdoTokenContract();
  return await callReadMethodSilent(contract, 'balanceOf', [address]);
};

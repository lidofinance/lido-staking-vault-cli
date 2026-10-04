import { getContract, GetContractReturnType, PublicClient } from 'viem';
import { getStandConfig } from '../../config';
import { aragonTokenManagerAbi } from '../abi';
import { getClient, callReadMethodSilent } from '../../providers';
import { callWriteMethod } from '../../providers/contractWrite';
import type { Account } from 'viem';

export const getAragonTokenManagerContract = async (): Promise<
  GetContractReturnType<typeof aragonTokenManagerAbi, PublicClient>
> => {
  const contractAddress = getStandConfig().contracts.aragonTokenManager;
  return getContract({
    address: contractAddress,
    abi: aragonTokenManagerAbi,
    client: getClient(),
  });
};

export const createVote = async (account: Account, evmScript: any) => {
  const contract = await getAragonTokenManagerContract();

  // Check spendable balance in TokenManager (not just LDO balance)
  const spendableBalance = await callReadMethodSilent(
    contract,
    'spendableBalanceOf',
    [account.address],
  );

  // Check if TokenManager can forward the script
  const canForward = await callReadMethodSilent(contract, 'canForward', [
    account.address,
    evmScript,
  ]);

  if (!canForward) {
    throw new Error(
      `TokenManager cannot forward: account ${account.address} has spendable balance ${spendableBalance}, but canForward returned false`,
    );
  }

  return await callWriteMethod({
    account,
    contract,
    methodName: 'forward',
    payload: [evmScript],
  });
};

import { getContract, GetContractReturnType } from 'viem';
import { tokenManagerAbi } from 'abi';
import { getTokenMasterAddress } from 'configs';
import { getPublicClient } from 'providers';

export const getTokenManagerContract = (): GetContractReturnType<
  typeof tokenManagerAbi
> => {
  const address = getTokenMasterAddress();
  return getContract({
    address,
    abi: tokenManagerAbi,
    client: getPublicClient(),
  });
};

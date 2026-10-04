import { getContract, GetContractReturnType, PublicClient } from 'viem';

import { LidoLocatorAbi } from '../../../abi';
import { getClient } from '../providers';
import { getStandConfig } from '../config';

export const getLocatorContract = async (): Promise<
  GetContractReturnType<typeof LidoLocatorAbi, PublicClient>
> => {
  const address = getStandConfig().contracts.lidoLocator;

  return getContract({
    address,
    abi: LidoLocatorAbi,
    client: getClient(),
  });
};

import { getContract, GetContractReturnType } from 'viem';
import { validatorConsolidationRequestsAbi } from 'abi';
import { getPublicClient } from 'providers';
import { WalletClient } from 'viem';
import { getValidatorConsolidationRequestsAddress } from 'configs';

export const getValidatorConsolidationRequestsContract = async (): Promise<
  GetContractReturnType<typeof validatorConsolidationRequestsAbi, WalletClient>
> => {
  const publicClient = await getPublicClient();

  return getContract({
    address: getValidatorConsolidationRequestsAddress(),
    abi: validatorConsolidationRequestsAbi,
    client: publicClient,
  });
};

export type ValidatorConsolidationRequestsContract = Awaited<
  ReturnType<typeof getValidatorConsolidationRequestsContract>
>;

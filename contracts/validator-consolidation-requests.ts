import { getContract, GetContractReturnType } from 'viem';
import { validatorConsolidationRequestsAbi } from 'abi';
import { getPublicClient, RegisteredPublicClient } from 'providers';
import { getValidatorConsolidationRequestsAddress } from 'configs';

export const getValidatorConsolidationRequestsContract =
  async (): Promise<ValidatorConsolidationRequestsContract> => {
    const publicClient = await getPublicClient();

    return getContract({
      address: getValidatorConsolidationRequestsAddress(),
      abi: validatorConsolidationRequestsAbi,
      client: publicClient,
    });
  };

export type ValidatorConsolidationRequestsContract = GetContractReturnType<
  typeof validatorConsolidationRequestsAbi,
  RegisteredPublicClient
>;

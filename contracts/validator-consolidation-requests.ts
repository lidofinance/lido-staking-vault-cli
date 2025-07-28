import { getContract, GetContractReturnType } from 'viem';
import { validatorConsolidationRequestsAbi } from 'abi';
import { getPublicClient } from 'providers';
import { WalletClient, Address } from 'viem';
import { getValidatorConsolidationRequestsAddress } from 'configs';

export const getValidatorConsolidationRequestsContract =
  (): GetContractReturnType<
    typeof validatorConsolidationRequestsAbi,
    WalletClient
  > => {
    return getContract({
      address: getValidatorConsolidationRequestsAddress(),
      abi: validatorConsolidationRequestsAbi,
      client: getPublicClient(),
    });
  };

export const getAccountWithDelegatedValidatorConsolidationRequestsContract = (
  address: Address,
): GetContractReturnType<
  typeof validatorConsolidationRequestsAbi,
  WalletClient
> => {
  return getContract({
    address,
    abi: validatorConsolidationRequestsAbi,
    client: getPublicClient(),
  });
};

import { getContract, GetContractReturnType } from 'viem';
import { validatorConsolidationRequestsAbi } from 'abi';
import { getPublicClient } from 'providers';
import { WalletClient } from 'viem';
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

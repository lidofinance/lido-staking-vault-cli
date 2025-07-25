import { getContract, GetContractReturnType } from 'viem';
import { validatorConsolidationRequestsAbi } from 'abi';
import { getValidatorConsolidationRequestsAddress } from 'configs';
import { getPublicClient } from 'providers';
import { WalletClient } from 'viem';

export const getValidatorConsolidationRequestsContract =
  (): GetContractReturnType<
    typeof validatorConsolidationRequestsAbi,
    WalletClient
  > => {
    const address = getValidatorConsolidationRequestsAddress();
    return getContract({
      address,
      abi: validatorConsolidationRequestsAbi,
      client: getPublicClient(),
    });
  };

import { getContract, GetContractReturnType } from 'viem';
import { PredepositGuaranteeAbi } from 'abi/index.js';
import { getLocatorContract } from 'contracts/locator.js';
import { getPublicClient, RegisteredPublicClient } from 'providers/index.js';

export const getPredepositGuaranteeContract =
  async (): Promise<PredepositGuaranteeContract> => {
    const locator = await getLocatorContract();
    const address = await locator.read.predepositGuarantee();
    const publicClient = await getPublicClient();

    return getContract({
      address,
      abi: PredepositGuaranteeAbi,
      client: publicClient,
    });
  };

export type PredepositGuaranteeContract = GetContractReturnType<
  typeof PredepositGuaranteeAbi,
  RegisteredPublicClient
>;

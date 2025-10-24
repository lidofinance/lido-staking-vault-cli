import {
  getContract,
  createPublicClient,
  http,
  GetContractReturnType,
  WalletClient,
} from 'viem';
import { PredepositGuaranteeAbi } from 'abi/index.js';
import { getChain, getElUrl } from 'configs';
import { getLocatorContract } from 'contracts';

export const getPredepositGuaranteeContract = async (): Promise<
  GetContractReturnType<typeof PredepositGuaranteeAbi, WalletClient>
> => {
  const locator = getLocatorContract();
  const address = await locator.read.predepositGuarantee();

  return getContract({
    address,
    abi: PredepositGuaranteeAbi,
    client: createPublicClient({
      chain: getChain(),
      transport: http(getElUrl()),
    }),
  });
};

export type PredepositGuaranteeContract = Awaited<
  ReturnType<typeof getPredepositGuaranteeContract>
>;

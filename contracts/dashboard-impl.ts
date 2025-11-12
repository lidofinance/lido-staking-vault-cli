import {
  getContract,
  createPublicClient,
  http,
  GetContractReturnType,
  PublicClient,
} from 'viem';
import { DashboardAbi } from 'abi';
import { getChain, getDashboardImplAddress, getElUrl } from 'configs';

export const getDashboardImplContract = (): GetContractReturnType<
  typeof DashboardAbi,
  PublicClient
> => {
  const elUrl = getElUrl();
  const address = getDashboardImplAddress();

  return getContract({
    address,
    abi: DashboardAbi,
    client: createPublicClient({
      chain: getChain(),
      transport: http(elUrl),
    }),
  });
};

export type DashboardImplContract = ReturnType<typeof getDashboardImplContract>;

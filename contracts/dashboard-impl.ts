import {
  getContract,
  createPublicClient,
  http,
  GetContractReturnType,
  PublicClient,
} from 'viem';
import { DashboardAbi } from 'abi';
import { getChain, getDashboardImplAddress, getElUrl } from 'configs';

export const getDashboardImplContract = async (): Promise<
  GetContractReturnType<typeof DashboardAbi, PublicClient>
> => {
  const elUrl = getElUrl();
  const chain = await getChain();
  const address = getDashboardImplAddress();

  return getContract({
    address,
    abi: DashboardAbi,
    client: createPublicClient({
      chain,
      transport: http(elUrl),
    }),
  });
};

export type DashboardImplContract = Awaited<
  ReturnType<typeof getDashboardImplContract>
>;

import { getContract, GetContractReturnType } from 'viem';
import { DashboardAbi } from 'abi';
import { getDashboardImplAddress } from 'configs';
import { getPublicClient, RegisteredPublicClient } from 'providers/index.js';

export const getDashboardImplContract =
  async (): Promise<DashboardImplContract> => {
    const publicClient = await getPublicClient();
    const address = getDashboardImplAddress();

    return getContract({
      address,
      abi: DashboardAbi,
      client: publicClient,
    });
  };

export type DashboardImplContract = Awaited<
  GetContractReturnType<typeof DashboardAbi, RegisteredPublicClient>
>;

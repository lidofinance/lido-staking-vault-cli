import {
  getContract,
  Address,
  createPublicClient,
  http,
  GetContractReturnType,
  WalletClient,
} from 'viem';
import { hoodi } from 'viem/chains';
import { DashboardFactoryAbi } from 'abi';
import { getChain, getElUrl } from 'configs';

const DashboardFactoryAddresses: Record<number, Address> = {
  [hoodi.id]: '0x8eaeeeff64398f28864dbd39492889ff078e04ff',
};

export const getDashboardFactoryContract = async (): Promise<
  GetContractReturnType<typeof DashboardFactoryAbi, WalletClient>
> => {
  const chain = await getChain();
  const address = DashboardFactoryAddresses[chain.id];

  if (!address) {
    throw new Error(
      `DashboardFactory contract not found for chain ${chain.id}`,
    );
  }

  return getContract({
    address: address,
    abi: DashboardFactoryAbi,
    client: createPublicClient({
      chain,
      transport: http(getElUrl()),
    }),
  });
};

export type DashboardFactoryContract = Awaited<
  ReturnType<typeof getDashboardFactoryContract>
>;

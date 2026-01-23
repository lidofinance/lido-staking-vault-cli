import {
  getContract,
  Address,
  GetContractReturnType,
  WalletClient,
} from 'viem';
import { OssifiableProxyAbi } from 'abi/defi-wrapper/index.js';
import { getPublicClient } from 'providers';

export const getOssifiableProxyContract = async (
  address: Address,
): Promise<GetContractReturnType<typeof OssifiableProxyAbi, WalletClient>> => {
  const publicClient = await getPublicClient();

  return getContract({
    address: address,
    abi: OssifiableProxyAbi,
    client: publicClient,
  });
};

export type OssifiableProxyContract = Awaited<
  ReturnType<typeof getOssifiableProxyContract>
>;

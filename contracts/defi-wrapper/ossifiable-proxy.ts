import { getContract, Address, GetContractReturnType } from 'viem';
import { OssifiableProxyAbi } from 'abi/defi-wrapper/index.js';
import { getPublicClient, RegisteredPublicClient } from 'providers';

export const getOssifiableProxyContract = async (
  address: Address,
): Promise<OssifiableProxyContract> => {
  const publicClient = await getPublicClient();

  return getContract({
    address: address,
    abi: OssifiableProxyAbi,
    client: publicClient,
  });
};

export type OssifiableProxyContract = GetContractReturnType<
  typeof OssifiableProxyAbi,
  RegisteredPublicClient
>;

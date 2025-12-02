import {
  getContract,
  createPublicClient,
  http,
  GetContractReturnType,
  PublicClient,
} from 'viem';
import { LidoLocatorAbi } from 'abi';
import { getChain, getLocatorAddress, getElUrl } from 'configs';

export const getLocatorContract = async (): Promise<
  GetContractReturnType<typeof LidoLocatorAbi, PublicClient>
> => {
  const elUrl = getElUrl();
  const chain = await getChain();
  const address = getLocatorAddress();

  return getContract({
    address,
    abi: LidoLocatorAbi,
    client: createPublicClient({
      chain,
      transport: http(elUrl),
    }),
  });
};

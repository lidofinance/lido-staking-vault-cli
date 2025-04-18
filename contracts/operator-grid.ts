import { getContract, createPublicClient, http } from 'viem';
import { OperatorGridAbi } from 'abi/index.js';
import { getChain, getElUrl } from 'configs';
import { getLocatorContract } from 'contracts';

export const getOperatorGridContract = async () => {
  const locator = getLocatorContract();
  const address = await locator.read.operatorGrid();

  return getContract({
    address,
    abi: OperatorGridAbi,
    client: createPublicClient({
      chain: getChain(),
      transport: http(getElUrl()),
    }),
  });
};

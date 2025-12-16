import { Address, formatEther, getContract } from 'viem';

import { callReadMethodSilent, getClient } from '../providers';
import { getLocatorContract } from './lidoLocator';
import { StEthAbi } from '../../../abi';

export const getStethContract = async () => {
  const locator = await getLocatorContract();
  const address = await locator.read.lido();

  return getContract({
    address: address,
    abi: StEthAbi,
    client: getClient(),
  });
};

export const getPooledEthByShares = async (shares: bigint) => {
  const contract = await getStethContract();

  return formatEther(
    await callReadMethodSilent(contract, 'getPooledEthByShares', [shares]),
  );
};

export const getStEthBalance = async (address: Address) => {
  const contract = await getStethContract();
  return formatEther(
    await callReadMethodSilent(contract, 'balanceOf', [address]),
  );
};

export const getPooledEthBySharesRoundUp = async (shares: bigint) => {
  const contract = await getStethContract();

  return formatEther(
    await callReadMethodSilent(contract, 'getPooledEthBySharesRoundUp', [
      shares,
    ]),
  );
};

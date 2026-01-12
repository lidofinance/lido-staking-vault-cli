import { getStethContract } from 'contracts';
import { callReadMethodSilent } from 'utils';

export const calculateShareRate = async (
  blockNumber: number,
): Promise<bigint> => {
  const stEthContract = await getStethContract();

  const [totalSupply, getTotalShares] = await Promise.all([
    callReadMethodSilent({
      contract: stEthContract,
      methodName: 'totalSupply',
      payload: [
        {
          blockNumber: BigInt(blockNumber),
        },
      ],
    }),
    callReadMethodSilent({
      contract: stEthContract,
      methodName: 'getTotalShares',
      payload: [
        {
          blockNumber: BigInt(blockNumber),
        },
      ],
    }),
  ]);
  const shareRate =
    getTotalShares !== 0n ? (totalSupply * 10n ** 27n) / getTotalShares : 0n;

  return shareRate;
};

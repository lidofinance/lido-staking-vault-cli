import { formatEther } from 'viem';
import { callReadMethodSilent } from '../../utils/transactions/tx-private-key.js';
import { getStethContract } from 'contracts';
import { logInfo } from '../../utils/logging/index.js';

export const resolveStethShareLimit = async (
  amount: bigint,
  isSteth: boolean,
): Promise<bigint> => {
  if (!isSteth) return amount;

  const stethContract = await getStethContract();
  const shares = await callReadMethodSilent({
    contract: stethContract,
    methodName: 'getSharesByPooledEth',
    payload: [[amount]],
  });

  logInfo(
    `Converting ${formatEther(amount)} stETH → ${formatEther(shares)} shares`,
  );

  return shares;
};

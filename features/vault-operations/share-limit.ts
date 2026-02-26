import { formatEther } from 'viem';
import { getStethContract } from 'contracts';
import { callReadMethodSilent, logInfo } from 'utils';

export type ResolvedShareLimit = {
  shares: bigint;
  /** Human-readable label for confirmation prompts.
   *  Without --steth: "1000.0 shares"
   *  With --steth:    "1000.0 shares (1001.5 stETH)" */
  label: string;
};

export const resolveStethShareLimit = async (
  amount: bigint,
  isSteth: boolean,
): Promise<ResolvedShareLimit> => {
  if (!isSteth) {
    return { shares: amount, label: `${formatEther(amount)} shares` };
  }

  const stethContract = await getStethContract();
  const shares = await callReadMethodSilent({
    contract: stethContract,
    methodName: 'getSharesByPooledEth',
    payload: [[amount]],
  });

  logInfo(
    `Converting ${formatEther(amount)} stETH → ${formatEther(shares)} shares`,
  );

  return {
    shares,
    label: `${formatEther(shares)} shares (${formatEther(amount)} stETH)`,
  };
};

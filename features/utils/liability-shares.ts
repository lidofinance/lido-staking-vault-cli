import { formatEther } from 'viem';
import { DashboardContract } from 'contracts';
import { callReadMethodSilent, logError } from 'utils';

export const checkLiabilityShares = async (
  contract: DashboardContract,
  amountOfShares: bigint,
) => {
  const liabilityShares = await callReadMethodSilent({
    contract,
    methodName: 'liabilityShares',
    payload: [],
  });

  if (amountOfShares > liabilityShares) {
    logError(
      `Cannot burn more shares than the liability shares (Liability shares: ${formatEther(liabilityShares)}, Amount of shares to burn: ${formatEther(amountOfShares)})`,
    );
    return false;
  }

  return true;
};

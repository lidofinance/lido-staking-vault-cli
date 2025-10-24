import { DashboardContract } from 'contracts';
import { callReadMethodSilent, logError } from 'utils';

export const checkLiabilityShares = async (
  contract: DashboardContract,
  amountOfShares: bigint,
) => {
  const liabilityShares = await callReadMethodSilent(
    contract,
    'liabilityShares',
  );

  if (amountOfShares > liabilityShares) {
    logError('Cannot burn more shares than the liability shares');
    return false;
  }

  return true;
};

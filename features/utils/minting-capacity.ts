import { formatEther } from 'viem';

import { DashboardContract } from 'contracts';
import { callReadMethodSilent, logError } from 'utils';

export const checkMintingCapacity = async (
  contract: DashboardContract,
  amountOfShares: bigint,
) => {
  const remainingMintingCapacityShares = await callReadMethodSilent(
    contract,
    'remainingMintingCapacityShares',
    [0n],
  );
  if (remainingMintingCapacityShares < amountOfShares) {
    logError(
      `Cannot mint more shares than the vault can mint. Mintable: ${formatEther(remainingMintingCapacityShares)}`,
    );
    return false;
  }

  return true;
};

import { formatEther } from 'viem';

import { DashboardContract } from 'contracts';
import { logError } from 'utils';
import { vaultMintLimit } from 'features/mint-burn/mint-limit.js';

export const checkMintingCapacity = async (
  contract: DashboardContract,
  amountOfShares: bigint,
) => {
  const { remainingMintingCapacityShares } = await vaultMintLimit(contract);
  if (remainingMintingCapacityShares < amountOfShares) {
    logError(
      `Cannot mint more shares than the vault can mint. Mintable: ${formatEther(remainingMintingCapacityShares)} shares`,
    );
    return false;
  }

  return true;
};

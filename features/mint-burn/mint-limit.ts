import { getStethContract, type DashboardContract } from 'contracts';
import { bigIntMax, bigIntMin } from 'utils/big-int.js';

export const vaultMintLimit = async (
  dashboard: DashboardContract,
  ethToAdd = 0n,
) => {
  const lido = await getStethContract();
  const [
    totalMintingCapacityShares,
    remainingMintingCapacityShares,
    liabilityShares,
    lidoExternalShares,
    lidoMaxMintableExternalShares,
  ] = await Promise.all([
    dashboard.read.totalMintingCapacityShares(),
    dashboard.read.remainingMintingCapacityShares([0n]),
    // liability may not exactly equal to directly minted vault shares
    // but it's close enough for our calculations as vault owes these shares to lido anyway
    dashboard.read.liabilityShares(),
    lido.read.getExternalShares(),
    lido.read.getMaxMintableExternalShares(),
  ]);

  const remainingLidoCapacityShares = bigIntMax(
    lidoMaxMintableExternalShares - lidoExternalShares,
    0n,
  );

  const effectiveRemainingMintingCapacityShares = bigIntMin(
    remainingMintingCapacityShares,
    remainingLidoCapacityShares,
  );

  let addedRemainingMintingCapacityShares = remainingMintingCapacityShares;

  if (ethToAdd > 0n) {
    addedRemainingMintingCapacityShares =
      await dashboard.read.remainingMintingCapacityShares([ethToAdd]);
    addedRemainingMintingCapacityShares = bigIntMin(
      addedRemainingMintingCapacityShares,
      remainingLidoCapacityShares,
    );
  }

  return {
    totalMintingCapacityShares,
    liabilityShares,
    remainingMintingCapacityShares: effectiveRemainingMintingCapacityShares,
    addedRemainingMintingCapacityShares,
    addedMintingCapacityShares:
      addedRemainingMintingCapacityShares - remainingMintingCapacityShares,
    remainingLidoCapacityShares,
  };
};

import { Address, parseEther } from 'viem';

import {
  getStethContract,
  getDashboardContract,
  getStakingVaultContract,
} from 'contracts';
import { showSpinner } from 'utils';

export const getRequiredLockByShares = async (
  address: Address,
  newShares: string,
) => {
  const hideSpinner = showSpinner();

  const contract = getDashboardContract(address);
  const [stETHContract, socket, vault] = await Promise.all([
    getStethContract(),
    contract.read.vaultSocket(),
    contract.read.stakingVault(),
  ]);
  const pooledEthByShares = await stETHContract.read.getPooledEthByShares([
    socket.liabilityShares + parseEther(newShares),
  ]);

  const vaultContract = getStakingVaultContract(vault);
  const currentLock = await vaultContract.read.locked();

  const totalBasisPoints = 10000n;

  const requiredLock =
    (pooledEthByShares * totalBasisPoints) /
    (totalBasisPoints - BigInt(socket.reserveRatioBP));

  hideSpinner();

  return { requiredLock, currentLock };
};

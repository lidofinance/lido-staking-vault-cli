import { Address, parseEther } from 'viem';

import {
  getStethContract,
  getDashboardContract,
  getStakingVaultContract,
} from 'contracts';
import { callReadMethodSilent } from 'utils';

export const getRequiredLockByShares = async (
  address: Address,
  newShares: string,
) => {
  const contract = getDashboardContract(address);
  const [stETHContract, socket, vault] = await Promise.all([
    getStethContract(),
    callReadMethodSilent(contract, 'vaultSocket'),
    callReadMethodSilent(contract, 'stakingVault'),
  ]);
  const pooledEthByShares = await stETHContract.read.getPooledEthByShares([
    socket.liabilityShares + parseEther(newShares),
  ]);

  const vaultContract = getStakingVaultContract(vault);
  const currentLock = await callReadMethodSilent(vaultContract, 'locked');

  const totalBasisPoints = 10000n;

  const requiredLock =
    (pooledEthByShares * totalBasisPoints) /
    (totalBasisPoints - BigInt(socket.reserveRatioBP));

  return { requiredLock, currentLock };
};

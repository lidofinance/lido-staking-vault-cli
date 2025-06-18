import { formatEther } from 'viem';

import {
  callReadMethodSilent,
  confirmOperation,
  logInfo,
  logError,
} from 'utils';
import {
  DashboardContract,
  getStakingVaultContract,
  getVaultHubContract,
} from 'contracts';

import { submitReport } from './report.js';

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

export const checkIsReportFresh = async (contract: DashboardContract) => {
  const vault = await callReadMethodSilent(contract, 'stakingVault');
  const vaultHubContract = await getVaultHubContract();
  const vaultContract = getStakingVaultContract(vault);
  const isReportFresh = await callReadMethodSilent(
    vaultHubContract,
    'isReportFresh',
    [vaultContract.address],
  );

  if (!isReportFresh) {
    logInfo('The report is not fresh');
    const confirm = await confirmOperation(
      'Do you want to submit a fresh report?',
    );
    if (!confirm) return false;

    await submitReport({ vault });
    return true;
  }

  logInfo('The report is fresh');

  return isReportFresh;
};

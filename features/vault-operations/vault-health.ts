import { DashboardContract } from 'contracts';
import { reportFreshWarning } from 'features';
import {
  logTable,
  logInfo,
  logResult,
  formatBP,
  fetchAndCalculateVaultHealth,
  callReadMethodSilent,
} from 'utils';

export const getVaultHealthByDashboard = async (
  contract: DashboardContract,
) => {
  try {
    const vault = await callReadMethodSilent(contract, 'stakingVault');
    await reportFreshWarning(vault);

    const {
      healthRatio,
      isHealthy,
      totalValueInEth,
      liabilitySharesInSteth,
      forceRebalanceThresholdBP,
      liabilityShares,
    } = await fetchAndCalculateVaultHealth(contract);

    logResult({});
    logInfo('Vault Health');
    logTable({
      data: [
        ['Vault Healthy', isHealthy],
        ['Health Rate', `${healthRatio}%`],
        ['Total Value, ETH', totalValueInEth],
        ['Liability Shares', liabilityShares],
        ['Liability Shares in stETH', liabilitySharesInSteth],
        ['Rebalance Threshold, %', formatBP(forceRebalanceThresholdBP)],
      ],
    });
  } catch (err) {
    if (err instanceof Error) {
      logInfo('Error when getting info:\n', err.message);
    }
  }
};

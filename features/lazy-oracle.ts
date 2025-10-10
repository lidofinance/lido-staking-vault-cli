import { formatEther } from 'viem';

import { printError, showSpinner, logResult } from 'utils';
import { getLazyOracleContract } from 'contracts';

export const getLazyOracleBaseInfo = async () => {
  const hideSpinner = showSpinner();
  try {
    const contract = await getLazyOracleContract();

    const LIDO_LOCATOR = await contract.read.LIDO_LOCATOR();
    const DEFAULT_ADMIN_ROLE = await contract.read.DEFAULT_ADMIN_ROLE();
    const UPDATE_SANITY_PARAMS_ROLE =
      await contract.read.UPDATE_SANITY_PARAMS_ROLE();
    const MAX_QUARANTINE_PERIOD = await contract.read.MAX_QUARANTINE_PERIOD();
    const MAX_REWARD_RATIO = await contract.read.MAX_REWARD_RATIO();
    const MAX_LIDO_FEE_RATE_PER_SECOND =
      await contract.read.MAX_LIDO_FEE_RATE_PER_SECOND();
    const latestReportTimestamp = await contract.read.latestReportTimestamp();
    const quarantinePeriod = await contract.read.quarantinePeriod();
    const maxRewardRatioBP = await contract.read.maxRewardRatioBP();
    const maxLidoFeeRatePerSecond =
      await contract.read.maxLidoFeeRatePerSecond();
    const CONTRACT_ADDRESS = contract.address;

    hideSpinner();

    const payload = {
      CONTRACT_ADDRESS,
      LIDO_LOCATOR,
      DEFAULT_ADMIN_ROLE,
      UPDATE_SANITY_PARAMS_ROLE,
      MAX_QUARANTINE_PERIOD: `${MAX_QUARANTINE_PERIOD} (${Number(MAX_QUARANTINE_PERIOD) / 3600} hours)`,
      MAX_REWARD_RATIO,
      MAX_LIDO_FEE_RATE_PER_SECOND,
      latestReportTimestamp: `${latestReportTimestamp} (${new Date(Number(latestReportTimestamp) * 1000).toLocaleString()})`,
      quarantinePeriod: `${quarantinePeriod} (${Number(quarantinePeriod) / 3600} hours)`,
      maxRewardRatioBP: `${maxRewardRatioBP} (${Number(maxRewardRatioBP) / 100} %)`,
      maxLidoFeeRatePerSecond: `${maxLidoFeeRatePerSecond} (${formatEther(maxLidoFeeRatePerSecond)} ETH/s)`,
    };

    logResult({
      data: Object.entries(payload).map(([key, value]) => [key, value]),
    });
  } catch (err) {
    hideSpinner();
    printError(err, 'Error when getting base info');
  }
};

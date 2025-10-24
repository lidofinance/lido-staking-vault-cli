import { Address, formatEther } from 'viem';

import { getLazyOracleContract } from 'contracts';
import {
  callReadMethodSilent,
  logTable,
  logInfo,
  confirmOperation,
} from 'utils';

export const checkQuarantine = async (vault: Address) => {
  const lazyOracleContract = await getLazyOracleContract();

  const quarantine = await callReadMethodSilent(
    lazyOracleContract,
    'vaultQuarantine',
    [vault],
  );

  if (!quarantine.isActive)
    return {
      quarantine,
      until: null,
      start: null,
      leftHours: null,
    };

  const startTimestamp = new Date(
    Number(quarantine.startTimestamp) * 1000,
  ).toLocaleString();
  const endTimestamp = new Date(
    Number(quarantine.endTimestamp) * 1000,
  ).toLocaleString();
  const quarantineLeftSeconds =
    quarantine.endTimestamp - quarantine.startTimestamp;
  const quarantineLeftHours = Math.floor(
    (Number(quarantineLeftSeconds) * 1000) / (1000 * 60 * 60),
  );
  const pendingTotalValueIncrease = formatEther(
    quarantine.pendingTotalValueIncrease,
  );

  logInfo('⚠️ Warning: Part of the vault capital on CL is in quarantine');
  logInfo(
    `${pendingTotalValueIncrease} ETH will be added to the vault at ${endTimestamp} (after ${quarantineLeftHours} hours)`,
  );
  logTable({
    data: [
      ['Vault', vault],
      ['Quarantine status', quarantine.isActive ? 'Active' : 'Inactive'],
      ['Pending total value increase, ETH', pendingTotalValueIncrease],
      ['Start timestamp', `${quarantine.startTimestamp} (${startTimestamp})`],
      ['End timestamp', `${quarantine.endTimestamp} (${endTimestamp})`],
    ],
  });
  console.info('\n');

  return {
    quarantine,
    until: endTimestamp,
    start: startTimestamp,
    leftHours: quarantineLeftHours,
  };
};

export const confirmQuarantine = async (vault: Address) => {
  const quarantineInfo = await checkQuarantine(vault);

  if (quarantineInfo.quarantine.isActive) {
    const quarantineConfirm = await confirmOperation(
      `Part of the vault ${vault} capital on CL is quarantined until ${quarantineInfo.until} (from ${quarantineInfo.start}). Vault metrics will be updated after ~${quarantineInfo.leftHours} hours. Do you want to continue?`,
    );
    if (!quarantineConfirm) return false;
  }

  return true;
};

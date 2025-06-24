import { Address } from 'viem';

import { getVaultHubContract } from 'contracts';
import {
  callReadMethodSilent,
  confirmOperation,
  submitReport,
  logInfo,
} from 'utils';

export const checkIsReportFresh = async (vault: Address) => {
  const vaultHubContract = await getVaultHubContract();
  const isReportFresh = await callReadMethodSilent(
    vaultHubContract,
    'isReportFresh',
    [vault],
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
``;

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

export const reportFreshWarning = async (vault: Address): Promise<boolean> => {
  const vaultHubContract = await getVaultHubContract();
  const isReportFresh = await callReadMethodSilent(
    vaultHubContract,
    'isReportFresh',
    [vault],
  );

  if (!isReportFresh) {
    console.info('____________________________________________________');
    logInfo('⚠️  WARNING: Report needs to be submitted');
    console.info(
      '📊 Vault data is not current because the latest report has not been submitted yet.',
    );
    console.info(
      '🔄 To update the vault data, you need to submit the existing report.',
    );
    console.info(
      '💡 Use the report command to submit the report and refresh vault data.',
    );
    console.info('____________________________________________________');

    const confirm = await confirmOperation(
      'Do you want to submit a fresh report immediately?',
    );
    if (!confirm) return false;

    await submitReport({ vault });
    return true;
  }

  return true;
};

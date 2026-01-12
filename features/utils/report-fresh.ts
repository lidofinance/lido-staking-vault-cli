import { Address } from 'viem';

import { getVaultHubContract } from 'contracts';
import {
  callReadMethodSilent,
  confirmOperation,
  submitReport,
  logInfo,
  PopulatedTx,
  logError,
} from 'utils';
import { checkIsDisconnected } from './connection.js';

export const checkIsReportFreshThrowError = async ({
  vault,
}: {
  vault: Address;
}): Promise<void> => {
  const vaultHubContract = await getVaultHubContract();
  const isDisconnected = await checkIsDisconnected(vault);

  if (isDisconnected) {
    logError('The vault is disconnected');
    throw new Error(`The vault ${vault} is disconnected`);
  }

  const isReportFresh = await callReadMethodSilent({
    contract: vaultHubContract,
    methodName: 'isReportFresh',
    payload: [[vault]],
  });

  if (!isReportFresh) {
    logError(
      'The report is not fresh. Submit a fresh report to update the vault data by command: report w submit',
    );
    throw new Error(`The report for vault ${vault} is not fresh`);
  }
};

export const checkIsReportFresh = async ({
  vault,
  populateTx = false,
}: {
  vault: Address;
  populateTx?: boolean;
}): Promise<{ isFresh: boolean; data?: PopulatedTx }> => {
  const vaultHubContract = await getVaultHubContract();
  const isDisconnected = await checkIsDisconnected(vault);

  if (isDisconnected) return { isFresh: true, data: undefined };

  const isReportFresh = await callReadMethodSilent({
    contract: vaultHubContract,
    methodName: 'isReportFresh',
    payload: [[vault]],
  });

  if (!isReportFresh) {
    logInfo('The report is not fresh');
    const confirm = await confirmOperation(
      'Do you want to submit a fresh report?',
    );
    if (!confirm) return { isFresh: false, data: undefined };

    const result = await submitReport({ vault, populateTx });

    return result;
  }

  logInfo('The report is fresh');

  return { isFresh: true, data: undefined };
};

export const reportFreshWarning = async (vault: Address): Promise<boolean> => {
  const vaultHubContract = await getVaultHubContract();
  const isDisconnected = await checkIsDisconnected(vault);

  if (isDisconnected) return true;

  const isReportFresh = await callReadMethodSilent({
    contract: vaultHubContract,
    methodName: 'isReportFresh',
    payload: [[vault]],
  });

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

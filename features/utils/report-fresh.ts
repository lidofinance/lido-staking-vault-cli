import { Address } from 'viem';

import { getVaultHubContract } from 'contracts';
import {
  callReadMethodSilent,
  confirmOperation,
  submitReport,
  logInfo,
  PopulatedTx,
} from 'utils';

const checkIsDisconnected = async (vault: Address) => {
  const vaultHubContract = await getVaultHubContract();
  const connection = await callReadMethodSilent(
    vaultHubContract,
    'vaultConnection',
    [vault],
  );

  const isDisconnected =
    connection.owner === '0x0000000000000000000000000000000000000000' ||
    connection.vaultIndex === 0n;

  if (isDisconnected) {
    logInfo('⚠️  The vault is not connected to VaultHub  ⚠️');
    return true;
  }

  return false;
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

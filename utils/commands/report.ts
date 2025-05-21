import { Address, Hex } from 'viem';

import { getVaultHubContract } from 'contracts';
import {
  callReadMethod,
  fetchAndVerifyFile,
  getVaultReport,
  getVaultReportProofByCid,
  confirmPrompt,
  logCancel,
  callWriteMethodWithReceipt,
} from 'utils';

type SubmitReportArgs = {
  vault: Address;
  gateway?: string;
};

export const submitReport = async ({ vault, gateway }: SubmitReportArgs) => {
  const vaultHubContract = await getVaultHubContract();
  const [_vaultsDataTimestamp, _vaultsDataTreeRoot, vaultsDataReportCid] =
    await callReadMethod(vaultHubContract, 'latestReportData');

  await fetchAndVerifyFile(vaultsDataReportCid, gateway);

  const report = await getVaultReport({
    vault,
    cid: vaultsDataReportCid,
    gateway,
  });
  const reportProof = await getVaultReportProofByCid({
    vault,
    cid: report.proofsCID,
    gateway,
  });
  await fetchAndVerifyFile(report.proofsCID, gateway);

  const { confirm } = await confirmPrompt(
    `Are you sure you want to submit report for vault ${vault}?
        Total value wei: ${report.data.total_value_wei}
        In out delta: ${report.data.in_out_delta}
        Fee: ${report.data.fee}
        Liability shares: ${report.data.liability_shares}
        `,
    'confirm',
  );
  if (!confirm) {
    logCancel('Report not submitted');
    return;
  }

  await callWriteMethodWithReceipt({
    contract: vaultHubContract,
    methodName: 'updateVaultData',
    payload: [
      vault,
      BigInt(report.data.total_value_wei),
      BigInt(report.data.in_out_delta),
      BigInt(report.data.fee),
      BigInt(report.data.liability_shares),
      reportProof.proof as Hex[],
    ],
  });
};

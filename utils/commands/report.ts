import { Address, Hex } from 'viem';

import { getLazyOracleContract } from 'contracts';
import {
  callReadMethod,
  fetchAndVerifyFile,
  getVaultReport,
  getVaultReportProofByCid,
  logCancel,
  callWriteMethodWithReceipt,
  confirmOperation,
} from 'utils';
import { program } from 'command';

type SubmitReportArgs = {
  vault: Address;
  gateway?: string;
};

export const submitReport = async ({ vault, gateway }: SubmitReportArgs) => {
  const lazyOracleContract = await getLazyOracleContract();
  const [_vaultsDataTimestamp, _vaultsDataTreeRoot, vaultsDataReportCid] =
    await callReadMethod(lazyOracleContract, 'latestReportData');

  await fetchAndVerifyFile(vaultsDataReportCid, gateway);

  const { cacheUse } = program.opts();
  const report = await getVaultReport(
    {
      vault,
      cid: vaultsDataReportCid,
      gateway,
    },
    cacheUse,
  );
  const reportProof = await getVaultReportProofByCid(
    {
      vault,
      cid: report.proofsCID,
      gateway,
    },
    cacheUse,
  );
  await fetchAndVerifyFile(report.proofsCID, gateway);

  const confirm = await confirmOperation(
    `Are you sure you want to submit report for vault ${vault}?
        Total value wei: ${report.data.total_value_wei}
        In out delta: ${report.data.in_out_delta}
        Fee: ${report.data.fee}
        Liability shares: ${report.data.liability_shares}
        `,
  );
  if (!confirm) {
    logCancel('Report not submitted');
    return;
  }

  await callWriteMethodWithReceipt({
    contract: lazyOracleContract,
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

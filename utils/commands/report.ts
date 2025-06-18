import { Address } from 'viem';

import { getLazyOracleContract } from 'contracts';
import {
  callReadMethod,
  fetchAndVerifyFile,
  logCancel,
  callWriteMethodWithReceipt,
  confirmOperation,
  getReportProofByVault,
} from 'utils';

type SubmitReportArgs = {
  vault: Address;
  gateway?: string;
};

export const submitReport = async ({
  vault,
  gateway,
}: SubmitReportArgs): Promise<void> => {
  const lazyOracleContract = await getLazyOracleContract();
  const [_vaultsDataTimestamp, _vaultsDataTreeRoot, vaultsDataReportCid] =
    await callReadMethod(lazyOracleContract, 'latestReportData');

  await fetchAndVerifyFile(vaultsDataReportCid, gateway);

  const proof = await getReportProofByVault({
    vault,
    cid: vaultsDataReportCid,
    gateway,
  });
  await fetchAndVerifyFile(vaultsDataReportCid, gateway);

  const confirm = await confirmOperation(
    `Are you sure you want to submit report for vault ${vault}?
        Total value wei: ${proof.data.total_value_wei}
        Fee: ${proof.data.fee}
        Liability shares: ${proof.data.liability_shares}
        Slashing reserve: ${proof.data.slashing_reserve}
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
      BigInt(proof.data.total_value_wei),
      BigInt(proof.data.fee),
      BigInt(proof.data.liability_shares),
      BigInt(proof.data.slashing_reserve),
      proof.proof,
    ],
  });
};

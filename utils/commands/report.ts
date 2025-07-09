import { Address } from 'viem';
import { program } from 'command';

import { getLazyOracleContract } from 'contracts';
import {
  callReadMethod,
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

  const { cacheUse } = program.opts();
  const proof = await getReportProofByVault(
    {
      vault,
      cid: vaultsDataReportCid,
      gateway,
    },
    cacheUse,
  );

  const confirm = await confirmOperation(
    `Are you sure you want to submit report for vault ${vault}?
        Total value wei: ${proof.data.totalValueWei}
        Fee: ${proof.data.fee}
        Liability shares: ${proof.data.liabilityShares}
        Slashing reserve: ${proof.data.slashingReserve}
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
      BigInt(proof.data.totalValueWei),
      BigInt(proof.data.fee),
      BigInt(proof.data.liabilityShares),
      BigInt(proof.data.slashingReserve),
      proof.proof,
    ],
  });
};

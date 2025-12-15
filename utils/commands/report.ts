import { Address } from 'viem';
import { program } from 'command';

import { getLazyOracleContract, getVaultHubContract } from 'contracts';
import {
  callReadMethod,
  callReadMethodSilent,
  logCancel,
  callWriteMethodWithReceipt,
  confirmOperation,
  getReportProofByVault,
  PopulatedTx,
} from 'utils';

type SubmitReportArgs = {
  vault: Address;
  gateway?: string;
  populateTx?: boolean;
};

export const submitReport = async ({
  vault,
  gateway,
  populateTx = false,
}: SubmitReportArgs): Promise<{
  isFresh: boolean;
  data?: PopulatedTx;
}> => {
  const lazyOracleContract = await getLazyOracleContract();
  const vaultHubContract = await getVaultHubContract();

  const [
    _vaultsDataTimestamp,
    _vaultsDataRefSlot,
    _vaultsDataTreeRoot,
    vaultsDataReportCid,
  ] = await callReadMethod(lazyOracleContract, 'latestReportData');
  const isReportFresh = await callReadMethodSilent(
    vaultHubContract,
    'isReportFresh',
    [vault],
  );

  if (isReportFresh) {
    logCancel('Report is fresh. You dont need to submit it again');
    return { isFresh: true, data: undefined };
  }

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
    return { isFresh: false, data: undefined };
  }

  const reportCall = await callWriteMethodWithReceipt({
    contract: lazyOracleContract,
    methodName: 'updateVaultData',
    payload: [
      vault,
      BigInt(proof.data.totalValueWei),
      BigInt(proof.data.fee),
      BigInt(proof.data.liabilityShares),
      BigInt(proof.data.maxLiabilityShares),
      BigInt(proof.data.slashingReserve),
      proof.proof,
    ],
    populateTx,
  });

  return { isFresh: true, data: reportCall.data };
};

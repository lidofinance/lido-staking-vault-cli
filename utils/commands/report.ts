import { Address, TransactionReceipt } from 'viem';
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
  skipConfirmation?: boolean;
};

export const submitReport = async ({
  vault,
  gateway,
  skipConfirmation,
  populateTx = false,
}: SubmitReportArgs): Promise<{
  isFresh: boolean;
  receipt?: TransactionReceipt;
  tx?: Address;
  data?: PopulatedTx;
}> => {
  const lazyOracleContract = await getLazyOracleContract();
  const vaultHubContract = await getVaultHubContract();

  const [
    _vaultsDataTimestamp,
    _vaultsDataRefSlot,
    _vaultsDataTreeRoot,
    vaultsDataReportCid,
  ] = await callReadMethod({
    contract: lazyOracleContract,
    methodName: 'latestReportData',
    payload: [],
  });
  const isReportFresh = await callReadMethodSilent({
    contract: vaultHubContract,
    methodName: 'isReportFresh',
    payload: [[vault]],
  });

  if (isReportFresh) {
    logCancel('Report is fresh. You dont need to submit it again');
    return {
      isFresh: true,
    };
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

  const confirm = skipConfirmation
    ? true
    : await confirmOperation(
        `Are you sure you want to submit report for vault ${vault}?
        Total value wei: ${proof.data.totalValueWei}
        Fee: ${proof.data.fee}
        Liability shares: ${proof.data.liabilityShares}
        Slashing reserve: ${proof.data.slashingReserve}
        `,
      );
  if (!confirm) {
    logCancel('Report not submitted');
    return {
      isFresh: false,
    };
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

  return { isFresh: true, ...reportCall };
};

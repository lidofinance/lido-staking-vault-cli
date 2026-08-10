import {
  Address,
  hexToBigInt,
  decodeFunctionData,
  Hex,
  isHex,
  formatEther,
} from 'viem';

import { getPublicClient } from 'providers';
import {
  getDashboardContract,
  getValidatorConsolidationRequestsContract,
  DashboardContract,
} from 'contracts';
import {
  callReadMethodSilent,
  PopulatedTx,
  showSpinner,
  callWriteMethodWithReceipt,
  printError,
  confirmOperation,
  callWriteMethodWithReceiptBatchCalls,
  flattenSourcePubkeys,
  getSourceAndTargetPubkeysFromEncodedCall,
  addDummyTargetAndSourceValidator,
  logCancel,
  findRecentFeeExemptions,
  formatFeeExemptionMatch,
  consolidatedBalance,
  FEE_EXEMPTION_DUPLICATE_LOOKBACK_SEC,
  FeeExemptionMatch,
  logError,
} from 'utils';
import { DashboardAbi } from 'abi';
import { TargetAndSourceValidators } from 'utils/consolidation/types.js';

// https://eips.ethereum.org/EIPS/eip-7251
const CONSOLIDATION_REQUEST_PREDEPLOY_ADDRESS =
  '0x0000BBdDc7CE488642fb579F8B00f3a590007251';

const getConsolidationRequestFee = async (): Promise<bigint> => {
  const publicClient = await getPublicClient();

  const hideSpinnerGetFeePerRequest = showSpinner();

  const { data: feePerRequestData } = await publicClient.call({
    to: CONSOLIDATION_REQUEST_PREDEPLOY_ADDRESS,
    data: '0x',
    blockTag: 'latest',
  });

  hideSpinnerGetFeePerRequest();

  if (!feePerRequestData || feePerRequestData === '0x') {
    throw new Error('Fee read returned empty or invalid data');
  }

  if (!isHex(feePerRequestData)) {
    throw new Error(`Unexpected data format: ${feePerRequestData}`);
  }

  const hexBody = feePerRequestData.startsWith('0x')
    ? feePerRequestData.slice(2)
    : feePerRequestData;

  if (hexBody.length !== 64) {
    throw new Error(
      `Unexpected data length (${hexBody.length} hex chars, expected 64)`,
    );
  }

  return hexToBigInt(feePerRequestData);
};

const consolidateRequest = async ({
  encodedCall,
  feePerRequest,
}: {
  encodedCall: Hex;
  feePerRequest: bigint;
}): Promise<void> => {
  const populatedTx: PopulatedTx = {
    to: CONSOLIDATION_REQUEST_PREDEPLOY_ADDRESS,
    data: encodedCall,
    value: feePerRequest,
  };
  await callWriteMethodWithReceiptBatchCalls({
    calls: [populatedTx],
    withSpinner: true,
    silent: false,
    skipError: false,
  });
};

const addFeeExemption = async ({
  feeExemptionEncodedCall,
  balanceToAdjust,
  dashboard,
}: {
  feeExemptionEncodedCall: Hex;
  balanceToAdjust: bigint;
  dashboard: Address;
}): Promise<void> => {
  const { functionName, args } = decodeFunctionData({
    abi: DashboardAbi,
    data: feeExemptionEncodedCall,
  });

  if (functionName !== 'addFeeExemption')
    throw new Error('functionName is not addFeeExemption');

  const decodedBalanceToAdjust = args[0];
  if (decodedBalanceToAdjust !== balanceToAdjust)
    throw new Error('decodedBalanceToAdjust is not equal to balanceToAdjust');

  await callWriteMethodWithReceipt({
    contract: await getDashboardContract(dashboard),
    methodName: 'addFeeExemption',
    payload: [balanceToAdjust],
  });
};

export const consolidationRequestsAndIncreaseFeeExemption = async ({
  targetAndSourceValidators,
  feeExemption,
  dashboard,
}: {
  targetAndSourceValidators: TargetAndSourceValidators;
  feeExemption: bigint;
  dashboard: Address;
}) => {
  const publicClient = await getPublicClient();

  const targetPubkeys = [...targetAndSourceValidators.keys()];
  const sourcePubkeysFlattened = flattenSourcePubkeys(
    targetAndSourceValidators,
  );

  const consolidationContract =
    await getValidatorConsolidationRequestsContract();

  const { data } = await publicClient.call({
    to: CONSOLIDATION_REQUEST_PREDEPLOY_ADDRESS,
    data: '0x',
    blockTag: 'latest',
  });

  if (!data) throw new Error('Fee per request read method returned empty data');
  const feePerRequest = hexToBigInt(data);
  let feeExemptionEncodedCall: Hex;
  let populatedTxs: PopulatedTx[] = [];

  if (targetAndSourceValidators.size > 0) {
    // 1. Fetch consolidation request encoded calls and increase fee exemption amount encoded call.
    const [feeExemptionEncodedCallResult, consolidationRequestEncodedCalls] =
      await callReadMethodSilent({
        contract: consolidationContract,
        methodName: 'getConsolidationRequestsAndFeeExemptionEncodedCalls',
        payload: [
          [sourcePubkeysFlattened, targetPubkeys, dashboard, feeExemption],
        ],
      });
    feeExemptionEncodedCall = feeExemptionEncodedCallResult;

    // 2. Create populated transactions for consolidation requests
    populatedTxs = consolidationRequestEncodedCalls.map((call) => {
      return {
        to: CONSOLIDATION_REQUEST_PREDEPLOY_ADDRESS,
        data: call,
        value: feePerRequest,
      };
    });
  } else {
    addDummyTargetAndSourceValidator(targetAndSourceValidators, feeExemption);
    [feeExemptionEncodedCall] =
      await getConsolidationRequestsAndFeeExemptionEncodedCalls(
        targetAndSourceValidators,
        dashboard,
        feeExemption,
      );
  }

  // 3. Create populated transaction to increase the fee exemption amount
  if (feeExemption > 0n) {
    populatedTxs.push({
      to: dashboard,
      data: feeExemptionEncodedCall,
    });
  }

  return populatedTxs;
};

const getConsolidationRequestsAndFeeExemptionEncodedCalls = async (
  targetAndSourceValidators: TargetAndSourceValidators,
  dashboard: Address,
  feeExemption: bigint,
): Promise<[Hex, readonly Hex[]]> => {
  const targetPubkeys = [...targetAndSourceValidators.keys()];
  const sourcePubkeysFlattened = flattenSourcePubkeys(
    targetAndSourceValidators,
  );

  const consolidationContract =
    await getValidatorConsolidationRequestsContract();

  const [feeExemptionEncodedCall, consolidationRequestEncodedCalls] =
    await callReadMethodSilent({
      contract: consolidationContract,
      methodName: 'getConsolidationRequestsAndFeeExemptionEncodedCalls',
      payload: [
        [sourcePubkeysFlattened, targetPubkeys, dashboard, feeExemption],
      ],
    });
  return [feeExemptionEncodedCall, consolidationRequestEncodedCalls];
};

export const consolidateAndIncreaseFeeExemptionWithoutBatching = async ({
  targetAndSourceValidators,
  feeExemption,
  dashboard,
}: {
  targetAndSourceValidators: TargetAndSourceValidators;
  feeExemption: bigint;
  dashboard: Address;
}) => {
  let currentFeeExemption = 0n;
  const consolidatedSourcePubkeys: Hex[] = [];

  try {
    let feeExemptionEncodedCall: Hex;
    let consolidationRequestEncodedCalls: readonly Hex[];

    if (targetAndSourceValidators.size > 0) {
      [feeExemptionEncodedCall, consolidationRequestEncodedCalls] =
        await getConsolidationRequestsAndFeeExemptionEncodedCalls(
          targetAndSourceValidators,
          dashboard,
          feeExemption,
        );

      for (const encodedCall of consolidationRequestEncodedCalls) {
        const { sourcePubkey, targetPubkey } =
          getSourceAndTargetPubkeysFromEncodedCall(encodedCall);
        const feePerRequest = await getConsolidationRequestFee();

        const lines = [
          'Are you sure you want to consolidate the following validators?\n',
          `Source: ${sourcePubkey}\nTarget: ${targetPubkey}\n`,
          `Fee Per Request: ${formatEther(feePerRequest)} ETH (wei: ${feePerRequest})`,
        ];
        const confirmFileContent = await confirmOperation(lines.join('\n'));
        if (!confirmFileContent)
          throw new Error('User cancelled consolidation');

        await consolidateRequest({
          encodedCall: encodedCall,
          feePerRequest: feePerRequest,
        });

        const consolidatedSource = targetAndSourceValidators
          .get(targetPubkey)
          ?.sourceValidators.get(sourcePubkey);
        // same basis as calculateAndConfirmFeeExemption, or the remainder below goes negative
        currentFeeExemption += consolidatedSource
          ? consolidatedBalance(consolidatedSource)
          : 0n;

        consolidatedSourcePubkeys.push(sourcePubkey);
      }
    } else {
      // If there are no validators to consolidate,
      // add a dummy target and source validator to call addFeeExemption method only
      addDummyTargetAndSourceValidator(targetAndSourceValidators, feeExemption);
      [feeExemptionEncodedCall] =
        await getConsolidationRequestsAndFeeExemptionEncodedCalls(
          targetAndSourceValidators,
          dashboard,
          feeExemption,
        );
    }
    if (feeExemption > 0n) {
      const lines = [
        'Are you sure you want to increase the fee exemption amount?\n',
        `Balance To Adjust: ${formatEther(feeExemption)} ETH (wei: ${feeExemption})`,
      ];
      const confirmFileContent = await confirmOperation(lines.join('\n'));
      if (!confirmFileContent)
        throw new Error('User cancelled increasing fee exemption amount');

      await addFeeExemption({
        feeExemptionEncodedCall: feeExemptionEncodedCall,
        balanceToAdjust: feeExemption,
        dashboard: dashboard,
      });
    }
  } catch (error) {
    const message = `Error when consolidating and increasing fee exemption without batching.
    ${feeExemption > 0n ? `The balance that should be consolidated is ${formatEther(feeExemption)} ETH.` : ''}
    ${feeExemption > 0n ? `The balance you have consolidated is ${formatEther(currentFeeExemption)} ETH.` : ''}
    ${feeExemption > 0n ? `The remaining balance to be consolidated is ${formatEther(feeExemption - currentFeeExemption)} ETH.` : ''}
    ${consolidatedSourcePubkeys.length > 0 ? `Source pubkeys that were consolidated: ${consolidatedSourcePubkeys.join('\n')}` : ''}
    `;

    printError(error, message);
  }
};

// addFeeExemption is a delta (settledGrowth += amount), so every batch needs one;
// skip is offered only on on-chain evidence that this batch's exemption already landed
export const confirmFeeExemptionIncrease = async (
  dashboardContract: DashboardContract,
  newFeeExemption: bigint,
): Promise<{ shouldAddFeeExemption: boolean }> => {
  if (newFeeExemption === 0n) {
    return { shouldAddFeeExemption: false };
  }

  const latestCorrectionTimestamp = await callReadMethodSilent({
    contract: dashboardContract,
    methodName: 'latestCorrectionTimestamp',
    payload: [],
  });

  const lookbackStart =
    BigInt(Math.floor(Date.now() / 1000)) -
    FEE_EXEMPTION_DUPLICATE_LOOKBACK_SEC;

  // no recent correction — nothing to duplicate
  if (latestCorrectionTimestamp < lookbackStart) {
    return { shouldAddFeeExemption: true };
  }

  const hideSpinner = showSpinner();
  let matches: FeeExemptionMatch[] | null = null;
  try {
    matches = await findRecentFeeExemptions(
      dashboardContract.address,
      newFeeExemption,
    );
  } catch (error) {
    // logError, not printError — printError rethrows and would abort the flow
    logError('Could not scan recent fee exemptions.');
    if (error instanceof Error && error.message) logError(error.message);
  } finally {
    hideSpinner();
  }

  if (matches?.length === 0) {
    return { shouldAddFeeExemption: true };
  }

  // advisory only: the same RPC could have fabricated it (threat-model A3)
  const evidence = matches
    ? `A fee exemption matching this batch amount was already added recently (verify against a block explorer):
    ${matches.map(formatFeeExemptionMatch).join('\n    ')}`
    : `Could not scan recent on-chain fee exemptions (RPC error), but a manual settled growth correction happened recently on this vault.`;

  // must stay the first prompt — auto-confirm (--yes / test env) then means "add", not "skip"
  const addAnyway = await confirmOperation(
    `${evidence}
    Node-operator fee is based on vault growth above settled growth, and this call raises settled growth by the exempted amount.
    If the exemption for THIS SAME consolidation batch was already added, adding it again would raise settled growth twice.
    If it was not, the consolidated balance stays in the fee base once the consolidation is processed and reported.
    Add fee exemption of ${formatEther(newFeeExemption)} ETH now?`,
  );

  if (addAnyway) {
    return { shouldAddFeeExemption: true };
  }

  const confirmSkip = await confirmOperation(
    `Skip adding the fee exemption?
    Unless the exemption for this exact batch was already added, ${formatEther(newFeeExemption)} ETH stays in the node-operator fee base once the consolidation is processed and reported.`,
  );
  if (!confirmSkip) {
    logCancel('The user has canceled the fee exemption decision');
    throw new Error('User cancelled consolidation');
  }

  return { shouldAddFeeExemption: false };
};

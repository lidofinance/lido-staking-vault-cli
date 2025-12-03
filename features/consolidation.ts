import {
  Hex,
  Address,
  hexToBigInt,
  decodeFunctionData,
  isHex,
  formatUnits,
} from 'viem';

import { getPublicClient } from 'providers';
import {
  getDashboardContract,
  getValidatorConsolidationRequestsContract,
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

export const consolidationRequestsAndIncreaseFeeExemption = async (
  targetAndSourceValidators: TargetAndSourceValidators,
  feeExemption: bigint,
  dashboard: Address,
) => {
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

  // 1. Fetch consolidation request encoded calls and increase fee exemption amount encoded call.
  const [feeExemptionEncodedCall, consolidationRequestEncodedCalls] =
    await callReadMethodSilent(
      consolidationContract,
      'getConsolidationRequestsAndFeeExemptionEncodedCalls',
      [sourcePubkeysFlattened, targetPubkeys, dashboard, feeExemption],
    );

  // 2. Create populated transactions for consolidation requests
  const populatedTxs: PopulatedTx[] = consolidationRequestEncodedCalls.map(
    (call) => {
      return {
        to: CONSOLIDATION_REQUEST_PREDEPLOY_ADDRESS,
        data: call,
        value: feePerRequest,
      };
    },
  );

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
    await callReadMethodSilent(
      consolidationContract,
      'getConsolidationRequestsAndFeeExemptionEncodedCalls',
      [sourcePubkeysFlattened, targetPubkeys, dashboard, feeExemption],
    );
  return [feeExemptionEncodedCall, consolidationRequestEncodedCalls];
};

export const consolidateAndIncreaseFeeExemptionWithoutBatching = async (
  targetAndSourceValidators: TargetAndSourceValidators,
  feeExemption: bigint,
  dashboard: Address,
) => {
  let currentFeeExemption = 0n;

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
          `Fee Per Request: ${feePerRequest}`,
        ];
        const confirmFileContent = await confirmOperation(lines.join('\n'));
        if (!confirmFileContent)
          throw new Error('User cancelled consolidation');

        await consolidateRequest({
          encodedCall: encodedCall,
          feePerRequest: feePerRequest,
        });

        currentFeeExemption +=
          targetAndSourceValidators
            .get(targetPubkey)
            ?.sourceValidators.get(sourcePubkey)?.balance ?? 0n;
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
    const lines = [
      'Are you sure you want to increase the fee exemption amount?\n',
      `Balance To Adjust: ${feeExemption} in wei`,
    ];
    const confirmFileContent = await confirmOperation(lines.join('\n'));
    if (!confirmFileContent)
      throw new Error('User cancelled increasing fee exemption amount');

    await addFeeExemption({
      feeExemptionEncodedCall: feeExemptionEncodedCall,
      balanceToAdjust: feeExemption,
      dashboard: dashboard,
    });
  } catch (error) {
    printError(
      error,
      `Error when consolidating and increasing fee exemption without batching.
       The balance that should be consolidated is ${formatUnits(feeExemption, 18)} ETH.
       The balance you have consolidated is ${formatUnits(currentFeeExemption, 18)} ETH.
       The remaining balance to be consolidated is ${formatUnits(feeExemption - currentFeeExemption, 18)} ETH.`,
    );
  }
};

import {
  Hex,
  Address,
  zeroAddress,
  hexToBigInt,
  parseGwei,
  decodeFunctionData,
  isHex,
  hexToBytes,
  bytesToHex,
} from 'viem';

import { getPublicClient } from 'providers';
import {
  getDashboardContract,
  getValidatorConsolidationRequestsContract,
} from 'contracts';
import {
  finalityCheckpoints,
  checkSourceValidators,
  checkTargetValidators,
  callReadMethodSilent,
  checkPubkeys,
  PopulatedTx,
  fetchValidatorsInfo,
  ValidatorsInfo,
  showSpinner,
  callWriteMethodWithReceipt,
  printError,
  confirmOperation,
} from 'utils';
import { DashboardAbi } from 'abi';

// https://eips.ethereum.org/EIPS/eip-7251
const CONSOLIDATION_REQUEST_PREDEPLOY_ADDRESS =
  '0x0000BBdDc7CE488642fb579F8B00f3a590007251';

const getConsolidationRequestFee = async (): Promise<bigint> => {
  const publicClient = getPublicClient();

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
  const publicClient = getPublicClient();

  const hideSpinnerConsolidationRequest = showSpinner();
  const { data: consolidationRequestData } = await publicClient.call({
    to: CONSOLIDATION_REQUEST_PREDEPLOY_ADDRESS,
    data: encodedCall,
    value: feePerRequest,
  });
  hideSpinnerConsolidationRequest();

  if (!consolidationRequestData)
    throw new Error('consolidation request call returned empty data');
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

  const hideSpinnerAddFeeExemption = showSpinner();
  await callWriteMethodWithReceipt({
    contract: getDashboardContract(dashboard),
    methodName: 'addFeeExemption',
    payload: [balanceToAdjust],
  });
  hideSpinnerAddFeeExemption();
};

export const consolidationRequestsAndIncreaseFeeExemption = async (
  sourcePubkeys: Hex[][],
  targetPubkeys: Hex[],
  sourceValidatorsInfo: ValidatorsInfo,
  dashboard: Address,
) => {
  const publicClient = getPublicClient();

  const sourcePubkeysFlattened = sourcePubkeys.map(
    (group) => '0x' + group.map((p) => p.replace(/^0x/, '')).join(''),
  ) as Hex[];
  const consolidationContract = getValidatorConsolidationRequestsContract();
  const totalBalance = sourceValidatorsInfo.data.reduce(
    (sum, validator) => sum + parseGwei(validator.balance),
    0n,
  );

  const { data } = await publicClient.call({
    to: CONSOLIDATION_REQUEST_PREDEPLOY_ADDRESS,
    data: '0x',
    blockTag: 'latest',
  });

  if (!data) throw new Error('Fee read returned empty data');
  const feePerRequest = hexToBigInt(data);

  // 1. Fetch consolidation request encoded calls and increase fee exemption amount encoded call.
  const [feeExemptionEncodedCall, consolidationRequestEncodedCalls] =
    await callReadMethodSilent(
      consolidationContract,
      'getConsolidationRequestsAndFeeExemptionEncodedCalls',
      [sourcePubkeysFlattened, targetPubkeys, dashboard, totalBalance],
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
  if (totalBalance > 0n) {
    populatedTxs.push({
      to: dashboard,
      data: feeExemptionEncodedCall,
    });
  }

  return populatedTxs;
};

const getConsolidationRequestsAndFeeExemptionEncodedCalls = async (
  sourcePubkeysFlattened: Hex[],
  targetPubkeys: Hex[],
  dashboard: Address,
  sourceValidatorsInfo: ValidatorsInfo,
): Promise<[Hex, Hex[]]> => {
  const consolidationContract = getValidatorConsolidationRequestsContract();
  const totalBalance = sourceValidatorsInfo.data.reduce(
    (sum, validator) => sum + parseGwei(validator.balance),
    0n,
  );
  const [feeExemptionEncodedCall, consolidationRequestEncodedCalls] =
    await callReadMethodSilent(
      consolidationContract,
      'getConsolidationRequestsAndFeeExemptionEncodedCalls',
      [sourcePubkeysFlattened, targetPubkeys, dashboard, totalBalance],
    );

  return [feeExemptionEncodedCall, consolidationRequestEncodedCalls as Hex[]];
};

const getBalanceToAdjustForConsolidationRequestInWei = (
  sourceValidatorsInfo: ValidatorsInfo,
  sourcePubkey: Hex,
): bigint => {
  const sourceValidatorInfo = sourceValidatorsInfo.data.find(
    (validator) => validator.validator.pubkey === sourcePubkey,
  );
  if (!sourceValidatorInfo) throw new Error('source validator not found');
  return parseGwei(sourceValidatorInfo.balance);
};

export const consolidateAndIncreaseFeeExemptionWithoutBatching = async (
  sourcePubkeys: Hex[][],
  targetPubkeys: Hex[],
  sourceValidatorsInfo: ValidatorsInfo,
  dashboard: Address,
) => {
  try {
    const sourcePubkeysFlattened = sourcePubkeys.map(
      (group) => '0x' + group.map((p) => p.replace(/^0x/, '')).join(''),
    ) as Hex[];

    const [feeExemptionEncodedCall, consolidationRequestEncodedCalls] =
      await getConsolidationRequestsAndFeeExemptionEncodedCalls(
        sourcePubkeysFlattened,
        targetPubkeys,
        dashboard,
        sourceValidatorsInfo,
      );

    let balanceToAdjustInWei = 0n;

    for (const encodedCall of consolidationRequestEncodedCalls) {
      const encodedCallBytes = hexToBytes(encodedCall);
      const sourcePubkey = bytesToHex(
        encodedCallBytes.slice(0, encodedCallBytes.length / 2),
      );
      const targetPubkey = bytesToHex(
        encodedCallBytes.slice(encodedCallBytes.length / 2),
      );

      const feePerRequest = await getConsolidationRequestFee();

      const lines = [
        'Are you sure you want to consolidate the following validators?\n',
        `Target: ${targetPubkey}\nSource: ${sourcePubkey}\n`,
        `Fee Per Request: ${feePerRequest}`,
      ];
      const confirmFileContent = await confirmOperation(lines.join('\n'));
      if (!confirmFileContent) throw new Error('User cancelled consolidation');

      await consolidateRequest({
        encodedCall: encodedCall,
        feePerRequest: feePerRequest,
      });

      balanceToAdjustInWei += getBalanceToAdjustForConsolidationRequestInWei(
        sourceValidatorsInfo,
        sourcePubkey,
      );
    }

    if (balanceToAdjustInWei > 0n) {
      const lines = [
        'Are you sure you want to increase the fee exemption amount?\n',
        `Balance To Adjust: ${balanceToAdjustInWei} in wei`,
      ];
      const confirmFileContent = await confirmOperation(lines.join('\n'));
      if (!confirmFileContent)
        throw new Error('User cancelled increasing fee exemption amount');

      await addFeeExemption({
        feeExemptionEncodedCall: feeExemptionEncodedCall,
        balanceToAdjust: balanceToAdjustInWei,
        dashboard: dashboard,
      });
    }
  } catch (error) {
    printError(
      error,
      'Error when consolidating and increasing fee exemption without batching',
    );
  }
};

export const checkConsolidationInput = async (
  sourcePubkeys: Hex[][],
  targetPubkeys: Hex[],
  dashboard: Address,
  refundRecipient?: Address,
) => {
  const sourcePubkeysFlat = sourcePubkeys.flat();
  checkPubkeys(sourcePubkeysFlat);
  checkPubkeys(targetPubkeys);

  if (sourcePubkeys.length !== targetPubkeys.length) {
    throw new Error(
      'sourcePubkeys and targetPubkeys must have the same length',
    );
  }
  if (refundRecipient != null && refundRecipient === zeroAddress) {
    throw new Error('refundRecipient must be non-zero address');
  }
  if (dashboard === zeroAddress) {
    throw new Error('dashboard address must be non-zero address');
  }
};

export const checkValidators = async (
  sourcePubkeys: Hex[][],
  targetPubkeys: Hex[],
): Promise<{
  sourceValidatorsInfo: ValidatorsInfo;
  targetValidatorsInfo: ValidatorsInfo;
}> => {
  const finalityCheckpointsInfo = await finalityCheckpoints();
  const finalizedEpoch = Number(finalityCheckpointsInfo.data.finalized.epoch);
  const sourcePubkeysFlat = sourcePubkeys.flat();
  const sourceValidatorsInfo = await fetchValidatorsInfo(sourcePubkeysFlat);
  if (sourceValidatorsInfo.data == null) {
    throw new Error('sourceValidatorsInfo.data is null');
  }
  await checkSourceValidators(sourceValidatorsInfo.data, finalizedEpoch);

  const targetValidatorsInfo = await fetchValidatorsInfo(targetPubkeys);
  if (targetValidatorsInfo.data == null) {
    throw new Error('targetValidatorsInfo.data is null');
  }
  await checkTargetValidators(targetValidatorsInfo.data);

  return {
    sourceValidatorsInfo,
    targetValidatorsInfo,
  };
};

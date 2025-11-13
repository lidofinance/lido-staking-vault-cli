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
  callWriteMethodWithReceiptBatchCalls,
} from 'utils';
import { DashboardAbi } from 'abi';

export type ValidatorInfo = {
  status: string;
  balance: bigint;
  index: string;
};

export type TargetAndSourceValidators = Map<
  Hex,
  {
    info: ValidatorInfo;
    sourceValidators: Map<Hex, ValidatorInfo>;
  }
>;

// https://eips.ethereum.org/EIPS/eip-7251
const CONSOLIDATION_REQUEST_PREDEPLOY_ADDRESS =
  '0x0000BBdDc7CE488642fb579F8B00f3a590007251';

const flattenSourcePubkeys = (
  targetAndSourceValidators: TargetAndSourceValidators,
): `0x${string}`[] => {
  const targetPubkeys = [...targetAndSourceValidators.keys()];
  return targetPubkeys.map((target) => {
    const sourceMap = targetAndSourceValidators.get(target);
    if (!sourceMap) {
      throw new Error(`Target validator ${target} not found in map`);
    }

    const merged = [...sourceMap.sourceValidators.keys()]
      .map((p) => p.replace(/^0x/, ''))
      .join('');

    return `0x${merged}`;
  }) as `0x${string}`[];
};

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
    contract: getDashboardContract(dashboard),
    methodName: 'addFeeExemption',
    payload: [balanceToAdjust],
  });
};

export const consolidationRequestsAndIncreaseFeeExemption = async (
  targetAndSourceValidators: TargetAndSourceValidators,
  feeExemption: bigint,
  dashboard: Address,
) => {
  const publicClient = getPublicClient();

  const targetPubkeys = [...targetAndSourceValidators.keys()];
  const sourcePubkeysFlattened = flattenSourcePubkeys(
    targetAndSourceValidators,
  );

  const consolidationContract = getValidatorConsolidationRequestsContract();
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
): Promise<[Hex, Hex[]]> => {
  const targetPubkeys = [...targetAndSourceValidators.keys()];
  const sourcePubkeysFlattened = flattenSourcePubkeys(
    targetAndSourceValidators,
  );

  const consolidationContract = getValidatorConsolidationRequestsContract();
  const [feeExemptionEncodedCall, consolidationRequestEncodedCalls] =
    await callReadMethodSilent(
      consolidationContract,
      'getConsolidationRequestsAndFeeExemptionEncodedCalls',
      [sourcePubkeysFlattened, targetPubkeys, dashboard, feeExemption],
    );
  return [feeExemptionEncodedCall, consolidationRequestEncodedCalls as Hex[]];
};

export const consolidateAndIncreaseFeeExemptionWithoutBatching = async (
  targetAndSourceValidators: TargetAndSourceValidators,
  feeExemption: bigint,
  dashboard: Address,
) => {
  let currentFeeExemption = 0n;

  try {
    let feeExemptionEncodedCall;
    let consolidationRequestEncodedCalls;

    if (targetAndSourceValidators.size > 0) {
      [feeExemptionEncodedCall, consolidationRequestEncodedCalls] =
        await getConsolidationRequestsAndFeeExemptionEncodedCalls(
          targetAndSourceValidators,
          dashboard,
          feeExemption,
        );
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
      targetAndSourceValidators.set(
        '0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        {
          info: {
            status: 'active_ongoing',
            balance: feeExemption,
            index: '0',
          },
          sourceValidators: new Map([
            [
              '0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
              {
                status: 'active_ongoing',
                balance: feeExemption,
                index: '0',
              },
            ],
          ]),
        },
      );
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
      `Error when consolidating and increasing fee exemption without batching.\nThe balance that should be consolidated is ${feeExemption} in wei.\nThe balance you have consolidated is ${currentFeeExemption} in wei.`,
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

export const requestValidatorsInfo = async (
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
  checkSourceValidators(sourceValidatorsInfo.data, finalizedEpoch);

  const targetValidatorsInfo = await fetchValidatorsInfo(targetPubkeys);
  if (targetValidatorsInfo.data == null) {
    throw new Error('targetValidatorsInfo.data is null');
  }
  checkTargetValidators(targetValidatorsInfo.data);

  return {
    sourceValidatorsInfo,
    targetValidatorsInfo,
  };
};

export const removeInactiveValidators = (
  targetAndSourceValidators: TargetAndSourceValidators,
) => {
  for (const [target, sourceMap] of targetAndSourceValidators.entries()) {
    for (const [
      source,
      sourceValidatorInfo,
    ] of sourceMap.sourceValidators.entries()) {
      if (sourceValidatorInfo.status !== 'active_ongoing') {
        sourceMap.sourceValidators.delete(source);
      }
    }
    if (sourceMap.sourceValidators.size === 0) {
      targetAndSourceValidators.delete(target);
    }
  }
};

export const getTargetAndSourceValidatorsInfo = (
  targetPubkeys: Hex[],
  sourcePubkeys: Hex[][],
  sourceValidatorsInfo: ValidatorsInfo,
  targetValidatorsInfo: ValidatorsInfo,
): TargetAndSourceValidators => {
  const targetAndSourceValidatorsInfo: TargetAndSourceValidators = new Map();
  targetPubkeys.forEach((targetPubkey, i) => {
    const sourcePubkeysGroup = sourcePubkeys[i] ?? [];
    const targetValidatorInfo = targetValidatorsInfo.data.find(
      (validator) => validator.validator.pubkey === targetPubkey,
    );
    if (!targetValidatorInfo) {
      throw new Error(`Target validator with pubkey ${targetPubkey} not found`);
    }
    targetAndSourceValidatorsInfo.set(targetPubkey, {
      info: {
        status: targetValidatorInfo.status,
        balance: parseGwei(targetValidatorInfo.balance),
        index: targetValidatorInfo.index,
      },
      sourceValidators: new Map(),
    });
    sourcePubkeysGroup.forEach((sourcePubkey) => {
      const sourceValidatorInfo = sourceValidatorsInfo.data.find(
        (validator) => validator.validator.pubkey === sourcePubkey,
      );
      if (!sourceValidatorInfo) {
        throw new Error(
          `Source validator with pubkey ${targetPubkey} not found`,
        );
      }
      targetAndSourceValidatorsInfo
        .get(targetPubkey)
        ?.sourceValidators.set(sourcePubkey, {
          status: sourceValidatorInfo.status,
          balance: parseGwei(sourceValidatorInfo.balance),
          index: sourceValidatorInfo.index,
        });
    });
  });
  return targetAndSourceValidatorsInfo;
};

export const getFeeExemption = async (
  targetAndSourceValidators: TargetAndSourceValidators,
): Promise<bigint> => {
  let feeExemption = 0n;
  await forEachValidator(
    targetAndSourceValidators,
    async ({ source, sourceValidatorInfo }) => {
      if (sourceValidatorInfo.status === 'active_ongoing') {
        feeExemption += sourceValidatorInfo.balance;
      } else {
        const confirm = await confirmOperation(
          `Validator with this pubkey ${source} is not in active state. Should we consider its balance for fee exemption?`,
        );
        if (confirm) {
          feeExemption += sourceValidatorInfo.balance;
        }
      }
    },
  );
  return feeExemption;
};

export interface WalkValidatorArgs {
  target: Hex;
  source: Hex;
  targetValidatorInfo: ValidatorInfo;
  sourceValidatorInfo: ValidatorInfo;
}

export const forEachValidator = async (
  targetAndSourceValidators: TargetAndSourceValidators,
  fn: (args: WalkValidatorArgs) => Promise<void> | void,
): Promise<void> => {
  for (const [
    target,
    targetValidatorInfo,
  ] of targetAndSourceValidators.entries()) {
    for (const [
      source,
      sourceValidatorInfo,
    ] of targetValidatorInfo.sourceValidators.entries()) {
      const result = fn({
        target,
        source,
        targetValidatorInfo: targetValidatorInfo.info,
        sourceValidatorInfo: sourceValidatorInfo,
      });
      if (result instanceof Promise) {
        await result;
      }
    }
  }
};

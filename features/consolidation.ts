import { Hex, Address, zeroAddress, hexToBigInt } from 'viem';

import { getPublicClient } from 'providers';
import { getValidatorConsolidationRequestsContract } from 'contracts';
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
} from 'utils';

// https://eips.ethereum.org/EIPS/eip-7251
const CONSOLIDATION_REQUEST_PREDEPLOY_ADDRESS =
  '0x0000BBdDc7CE488642fb579F8B00f3a590007251';

export const consolidationRequestsAndIncreaseRewardsAdjustment = async (
  sourcePubkeys: Hex[][],
  targetPubkeys: Hex[],
  sourceValidatorsInfo: ValidatorsInfo,
  dashboard: Address,
) => {
  const publicClient = getPublicClient();

  const hideFeeSpinner = showSpinner({
    type: 'bouncingBar',
    message: 'Waiting for fee to be read...',
  });

  // 1. Get fee per request
  const { data } = await publicClient.call({
    to: CONSOLIDATION_REQUEST_PREDEPLOY_ADDRESS,
    data: '0x',
    blockTag: 'latest',
  });
  hideFeeSpinner();

  if (!data) throw new Error('Fee read returned empty data');
  const feePerRequest = hexToBigInt(data);

  // 2. Fetch consolidation request encoded calls and increase rewards adjustment encoded call.
  const sourcePubkeysFlattened = sourcePubkeys.map(
    (group) => '0x' + group.map((p) => p.replace(/^0x/, '')).join(''),
  ) as Hex[];
  const consolidationContract = getValidatorConsolidationRequestsContract();
  const totalBalance = sourceValidatorsInfo.data.reduce(
    (sum, validator) => sum + BigInt(validator.balance),
    0n,
  );
  const [adjustmentIncreaseEncodedCall, consolidationRequestEncodedCalls] =
    await callReadMethodSilent(
      consolidationContract,
      'getConsolidationRequestsAndAdjustmentIncreaseEncodedCalls',
      [sourcePubkeysFlattened, targetPubkeys, dashboard, totalBalance],
    );

  // 3. Create populated transactions for consolidation requests
  const populatedTxs: PopulatedTx[] = consolidationRequestEncodedCalls.map(
    (call) => {
      return {
        to: CONSOLIDATION_REQUEST_PREDEPLOY_ADDRESS,
        data: call,
        value: feePerRequest,
      };
    },
  );

  // 4. Create populated transaction for increase rewards adjustment
  if (totalBalance > 0n) {
    populatedTxs.push({
      to: dashboard,
      data: adjustmentIncreaseEncodedCall,
    });
  }

  return populatedTxs;
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

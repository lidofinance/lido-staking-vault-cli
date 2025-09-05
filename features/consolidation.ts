import { Hex, Address, zeroAddress, hexToBigInt } from 'viem';

import { getAccount, getPublicClient, getWalletWithAccount } from 'providers';
import {
  getValidatorConsolidationRequestsContract,
  getAccountWithDelegatedValidatorConsolidationRequestsContract,
} from 'contracts';
import {
  finalityCheckpoints,
  checkSourceValidators,
  checkTargetValidators,
  callReadMethodSilent,
  logInfo,
  callWriteMethodWithReceipt,
  checkPubkeys,
  PopulatedTx,
  fetchValidatorsInfo,
  ValidatorsInfo,
  showSpinner,
  logResult,
} from 'utils';
import { waitForTransactionReceipt } from 'viem/actions';

// Consolidation requires a fee to ensure it gets executed reliably.
// To increase the likelihood of completion, the fee is multiplied by FEE_INCREASE_FACTOR.
// Any unused portion of the fee will be refunded to the designated recipient.
const FEE_INCREASE_FACTOR = 20n;

// https://eips.ethereum.org/EIPS/eip-7251
const CONSOLIDATION_REQUEST_PREDEPLOY_ADDRESS =
  '0x0000BBdDc7CE488642fb579F8B00f3a590007251';

export const requestConsolidation = async (
  sourcePubkeys: Hex[][],
  targetPubkeys: Hex[],
  refundRecipient: Address,
  dashboard: Address,
  sourceValidatorsInfo: ValidatorsInfo,
) => {
  const account = await getAccount();
  const walletClient = await getWalletWithAccount();
  const consolidationContract = getValidatorConsolidationRequestsContract();
  const accountWithDelegatedValidatorConsolidationRequestsContract =
    getAccountWithDelegatedValidatorConsolidationRequestsContract(
      account.address,
    );

  const totalBalance = sourceValidatorsInfo.data.reduce(
    (sum, validator) => sum + BigInt(validator.balance),
    0n,
  );
  const feePerConsolidationRequest = await callReadMethodSilent(
    consolidationContract,
    'getConsolidationRequestFee',
  );

  const sourcePubkeysFlat: Hex[] = sourcePubkeys.flat();
  const totalFee =
    (feePerConsolidationRequest *
      BigInt(sourcePubkeysFlat.length) *
      (100n + FEE_INCREASE_FACTOR)) /
    100n;
  const sourcePubkeysFlattened = sourcePubkeys.map(
    (group) => '0x' + group.map((p) => p.replace(/^0x/, '')).join(''),
  ) as Hex[];

  const hideSpinner = showSpinner({
    type: 'bouncingBar',
    message: 'Waiting for delegated consolidation requests to be added...',
  });

  const authorization = await walletClient.signAuthorization({
    account: account,
    executor: 'self',
    contractAddress: consolidationContract.address,
  });

  hideSpinner();

  await callWriteMethodWithReceipt({
    contract: accountWithDelegatedValidatorConsolidationRequestsContract,
    methodName: 'addConsolidationRequestsAndIncreaseRewardsAdjustment',
    authorizationList: [authorization],
    payload: [
      sourcePubkeysFlattened,
      targetPubkeys,
      refundRecipient,
      dashboard,
      totalBalance,
    ],
    value: totalFee,
  });
};

export const revokeDelegate = async () => {
  const account = await getAccount();
  const walletClient = await getWalletWithAccount();
  const publicClient = getPublicClient();

  const hideAuthorizationSpinner = showSpinner({
    type: 'bouncingBar',
    message: 'Waiting for authorization to be revoked...',
  });

  const revokeAuthorization = await walletClient.signAuthorization({
    account: account,
    executor: 'self',
    contractAddress: zeroAddress,
  });
  hideAuthorizationSpinner();

  const hideRevokeAuthorizationSpinner = showSpinner({
    type: 'bouncingBar',
    message: 'Waiting for revoke authorization transaction to be executed...',
  });

  const txHash = await walletClient.sendTransaction({
    account: account,
    to: zeroAddress,
    chain: walletClient.chain,
    authorizationList: [revokeAuthorization],
  });
  hideRevokeAuthorizationSpinner();

  logInfo('revoke authorization tx hash:', txHash);

  const receipt = await waitForTransactionReceipt(publicClient, {
    hash: txHash,
    confirmations: 3,
  });

  logResult({
    data: [
      ['Revoke authorization tx hash', txHash],
      ['Revoke authorization tx status', receipt.status],
      ['Revoke authorization tx block number', receipt.blockNumber],
      ['Revoke authorization tx gas used', receipt.gasUsed],
    ],
  });

  const codeAfterRevokeAuthorization = await publicClient.getCode({
    address: account.address,
  });

  const isNotRevoked = codeAfterRevokeAuthorization !== '0x';
  if (isNotRevoked) {
    throw new Error(
      'Authorization is not revoked. Please call eoa-revoke-delegate command',
    );
  }

  logInfo('Authorization revoked successfully');
};

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
  const [consolidationRequestEncodedCalls, adjustmentIncreaseEncodedCall] =
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

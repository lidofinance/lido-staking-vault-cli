import { Hex, Address, zeroAddress, hexToBigInt, concat } from 'viem';

import { getAccount, getPublicClient, getWalletWithAccount } from 'providers';
import {
  getDashboardContract,
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
  callReadMethod,
  populateWriteTx,
  PopulatedTx,
  fetchValidatorsInfo,
  ValidatorsInfo,
  showSpinner,
  logResult,
} from 'utils';
import { getVaultHubContract } from 'contracts';
import { waitForTransactionReceipt } from 'viem/actions';

export type VaultConnection = {
  vaultIndex: bigint;
  owner: Address;
  pendingDisconnect: boolean;
};

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
  stakingVault: Address,
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
    methodName: 'addConsolidationRequestsEOA',
    authorizationList: [authorization],
    payload: [
      sourcePubkeysFlattened,
      targetPubkeys,
      refundRecipient,
      stakingVault,
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
  vaultConnectionOwner: Address, // dashboard contract address
) => {
  // 1. Get fee per request
  const publicClient = getPublicClient();
  const dashboardContract = getDashboardContract(vaultConnectionOwner);

  const hideFeeSpinner = showSpinner({
    type: 'bouncingBar',
    message: 'Waiting for fee to be read...',
  });

  const { data } = await publicClient.call({
    to: CONSOLIDATION_REQUEST_PREDEPLOY_ADDRESS,
    data: '0x',
    blockTag: 'latest',
  });
  hideFeeSpinner();

  if (!data) throw new Error('Fee read returned empty data');
  const feePerRequest = hexToBigInt(data);

  // 2. Create populated transactions for consolidation requests
  const populatedTxs: PopulatedTx[] = targetPubkeys.flatMap(
    (targetPubkey, pubkeyIndex) => {
      const sourcePubkeysGroup = sourcePubkeys[pubkeyIndex];

      if (!sourcePubkeysGroup?.length) return [];
      if (!targetPubkey || targetPubkey.length !== 98) {
        throw new Error(
          `Invalid target pubkey at index ${pubkeyIndex}: ${targetPubkey}`,
        );
      }

      return sourcePubkeysGroup.map((sourcePubkey) => {
        if (!sourcePubkey || sourcePubkey.length !== 98) {
          throw new Error(`Invalid source pubkey: ${sourcePubkey}`);
        }
        const calldata: Hex = concat([sourcePubkey, targetPubkey]);

        return {
          to: CONSOLIDATION_REQUEST_PREDEPLOY_ADDRESS,
          data: calldata,
          value: feePerRequest,
        };
      });
    },
  );

  // 3. Create populated transaction for increase rewards adjustment
  const totalBalance = sourceValidatorsInfo.data.reduce(
    (sum, validator) => sum + BigInt(validator.balance),
    0n,
  );
  if (totalBalance > 0n) {
    populatedTxs.push(
      populateWriteTx({
        contract: dashboardContract,
        methodName: 'increaseRewardsAdjustment',
        payload: [totalBalance],
      }),
    );
  }

  return populatedTxs;
};

export const checkConsolidationInput = async (
  sourcePubkeys: Hex[][],
  targetPubkeys: Hex[],
  stakingVault: Address,
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
  if (stakingVault === zeroAddress) {
    throw new Error('stakingVault must be non-zero address');
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
  await checkSourceValidators(sourceValidatorsInfo, finalizedEpoch);

  const targetValidatorsInfo = await fetchValidatorsInfo(targetPubkeys);
  await checkTargetValidators(targetValidatorsInfo);

  return {
    sourceValidatorsInfo,
    targetValidatorsInfo,
  };
};

export const checkVaultConnection = async (
  stakingVault: Address,
): Promise<VaultConnection> => {
  const vaultHub = await getVaultHubContract();
  const vaultConnection = await callReadMethod(vaultHub, 'vaultConnection', [
    stakingVault,
  ]);

  if (vaultConnection.vaultIndex === 0n || vaultConnection.pendingDisconnect) {
    throw new Error('Vault is not connected or is pending disconnect');
  }

  return vaultConnection;
};

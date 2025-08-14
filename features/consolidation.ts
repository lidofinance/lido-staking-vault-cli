import { getAccount, getPublicClient, getWalletWithAccount } from 'providers';
import { Hex, Address, zeroAddress } from 'viem';
import {
  callReadMethodSilent,
  logInfo,
  callWriteMethodWithReceipt,
  checkPubkeys,
} from 'utils';
import assert from 'assert';
import {
  getValidatorConsolidationRequestsContract,
  getAccountWithDelegatedValidatorConsolidationRequestsContract,
} from 'contracts/validator-consolidation-requests.js';
import { fetchValidatorsInfo, ValidatorsInfo } from 'utils/fetchCL.js';
import { hexToBigInt } from 'viem';
import { PopulatedTx } from 'utils/transactions/types.js';
import {
  callReadMethod,
  populateWriteTx,
} from 'utils/transactions/tx-private-key.js';
import { getDashboardContract } from 'contracts/dashboard.js';
import {
  finalityCheckpoints,
  checkSourceValidators,
  checkTargetValidators,
} from 'utils';
import { getVaultHubContract } from 'contracts';
import { VaultConnection } from 'contracts/vault-hub.js';

// Consolidation requires a fee to ensure it gets executed reliably.
// To increase the likelihood of completion, the fee is multiplied by FEE_INCREASE_FACTOR.
// Any unused portion of the fee will be refunded to the designated recipient.
const FEE_INCREASE_FACTOR = 20n;

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
  const totalBalance = sourceValidatorsInfo.data.reduce(
    (sum, validator) => sum + Number(validator.balance),
    0,
  );
  const feePerConsolidationRequest = await callReadMethodSilent(
    consolidationContract,
    'getConsolidationRequestFee',
  );

  const sourcePubkeysFlat = sourcePubkeys.flat();
  const totalFee =
    (feePerConsolidationRequest *
      BigInt(sourcePubkeysFlat.length) *
      (100n + FEE_INCREASE_FACTOR)) /
    100n;
  const accountWithDelegateedValidatorConsolidationRequestsContract =
    getAccountWithDelegatedValidatorConsolidationRequestsContract(
      account.address,
    );

  const authorization = await walletClient.signAuthorization({
    account: account,
    executor: 'self',
    contractAddress: consolidationContract.address,
  });
  const sourcePubkeysFlattened = sourcePubkeys.map(
    (group) => '0x' + group.map((p) => p.replace(/^0x/, '')).join(''),
  ) as Hex[];
  const result = await callWriteMethodWithReceipt({
    contract: accountWithDelegateedValidatorConsolidationRequestsContract,
    methodName: 'addConsolidationRequestsEOA',
    authorizationList: [authorization],
    payload: [
      sourcePubkeysFlattened,
      targetPubkeys,
      refundRecipient,
      stakingVault,
      BigInt(totalBalance),
    ],
    value: totalFee,
    withSpinner: false,
    silent: true,
  });
  logInfo('consolidation request tx hash:', result);
};

export const revokeDelegate = async () => {
  const account = await getAccount();
  const walletClient = await getWalletWithAccount();

  const revokeAuthorization = await walletClient.signAuthorization({
    account: account,
    executor: 'self',
    contractAddress: zeroAddress,
  });
  const revokeAuthorizationTxHash = await walletClient.sendTransaction({
    account: account,
    to: zeroAddress,
    chain: walletClient.chain,
    authorizationList: [revokeAuthorization],
  });
  logInfo('revoke authorization tx hash:', revokeAuthorizationTxHash);

  const revokeAuthorizationTxReceipt =
    await getPublicClient().waitForTransactionReceipt({
      hash: revokeAuthorizationTxHash,
    });
  logInfo('revoke authorization tx receipt:', revokeAuthorizationTxReceipt);

  const codeAfterRevokeAuthorization = await getPublicClient().getCode({
    address: account.address,
  });
  assert(
    codeAfterRevokeAuthorization === undefined,
    'code after revokeAuthorization is not empty',
  );
};

export const consolidationRequestsAndIncreaseRewardsAdjustment = async (
  sourcePubkeys: Hex[][],
  targetPubkeys: Hex[],
  sourceValidatorsInfo: ValidatorsInfo,
  vaultConnectionOwner: Address,
) => {
  const CONSOLIDATION_REQUEST_PREDEPLOY_ADDRESS =
    '0x0000BBdDc7CE488642fb579F8B00f3a590007251';

  // 1. Get fee per request
  const publicClient = getPublicClient();
  const { data } = await publicClient.call({
    to: CONSOLIDATION_REQUEST_PREDEPLOY_ADDRESS,
    data: '0x',
    blockTag: 'latest',
  });
  if (!data) throw new Error('Fee read returned empty data');
  const feePerRequest = hexToBigInt(data);

  // 2. Create populated transactions for consolidation requests
  const populatedTxs: PopulatedTx[] = targetPubkeys.flatMap(
    (targetPubkey, pubkeyIndex) => {
      const sourcePubkeysGroup = sourcePubkeys[pubkeyIndex] ?? [];
      return sourcePubkeysGroup.map((sourcePubkey) => {
        const calldata =
          `0x${sourcePubkey.slice(2)}${targetPubkey.slice(2)}` as Hex;
        return {
          to: CONSOLIDATION_REQUEST_PREDEPLOY_ADDRESS,
          data: calldata,
          value: feePerRequest,
        };
      });
    },
  );

  // 3. Create populated transaction for increase rewards adjustment
  const dashboardContract = getDashboardContract(vaultConnectionOwner);
  const totalBalance = sourceValidatorsInfo.data.reduce(
    (sum, validator) => sum + Number(validator.balance),
    0,
  );
  if (totalBalance > 0) {
    populatedTxs.push(
      populateWriteTx({
        contract: dashboardContract,
        methodName: 'increaseRewardsAdjustment',
        payload: [BigInt(totalBalance)],
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

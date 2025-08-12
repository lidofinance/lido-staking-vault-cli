import { getAccount, getPublicClient, getWalletWithAccount } from 'providers';
import { Hex, Address, zeroAddress } from 'viem';
import {
  callReadMethodSilent,
  logInfo,
  callWriteMethodWithReceipt,
} from 'utils';
import assert from 'assert';
import {
  getValidatorConsolidationRequestsContract,
  getAccountWithDelegatedValidatorConsolidationRequestsContract,
} from 'contracts/validator-consolidation-requests.js';
import { ValidatorsInfo } from 'utils/fetchCL.js';

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
  const account = getAccount();
  const walletClient = getWalletWithAccount();

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
  const account = getAccount();
  const walletClient = getWalletWithAccount();

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

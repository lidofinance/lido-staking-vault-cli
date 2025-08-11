import {
  stringTo2dArray,
  stringToAddress,
  stringToHexArray,
  callWriteMethodWithReceipt,
  callReadMethodSilent,
  fetchValidatorsInfo,
  finalityCheckpoints,
  logInfo,
  checkSourcePubkeys,
  checkTargetPubkeys,
} from 'utils';
import { consolidation } from './main.js';
import { Address, Hex, zeroAddress } from 'viem';
import {
  getAccountWithDelegatedValidatorConsolidationRequestsContract,
  getValidatorConsolidationRequestsContract,
} from 'contracts/validator-consolidation-requests.js';
import { getAccount, getPublicClient, getWalletWithAccount } from 'providers';
import assert from 'assert';

// Consolidation requires a fee to ensure it gets executed reliably.
// To increase the likelihood of completion, the fee is multiplied by FEE_INCREASE_FACTOR.
// Any unused portion of the fee will be refunded to the designated recipient.
const FEE_INCREASE_FACTOR = 20n;

const consolidationWrite = consolidation
  .command('write')
  .aliases(['w'])
  .description('consolidation write commands');

consolidationWrite
  .command('eoa-with-delegate')
  .description(
    'Set the Lido Consolidation contract as the delegate for the EOA using EIP-7702, call its method to consolidate N validators, and then revoke the authorization.',
  )
  .argument(
    '<source_pubkeys>',
    '2D array of source validator pubkeys: each inner list will be consolidated into a single target validator',
    stringTo2dArray,
  )
  .argument(
    '<target_pubkeys>',
    'List of target validator public keys to consolidate into. One target pubkey per group of source pubkeys',
    stringToHexArray,
  )
  .argument('<refund_recipient>', 'refund recipient address', stringToAddress)
  .argument('<staking_vault>', 'staking vault address', stringToAddress)
  .action(
    async (
      sourcePubkeys: Hex[][],
      targetPubkeys: Hex[],
      refundRecipient: Address,
      stakingVault: Address,
    ) => {
      const account = getAccount();
      const walletClient = getWalletWithAccount();

      const finalityCheckpointsInfo = await finalityCheckpoints();
      const finalizedEpoch = Number(
        finalityCheckpointsInfo.data.finalized.epoch,
      );

      // 1. Check source pubkeys
      const sourcePubkeysFlat = sourcePubkeys.flat();
      const sourceValidatorsInfo = await fetchValidatorsInfo(sourcePubkeysFlat);
      await checkSourcePubkeys(sourceValidatorsInfo, finalizedEpoch);

      // 2. Check target pubkeys
      const targetValidatorsInfo = await fetchValidatorsInfo(targetPubkeys);
      await checkTargetPubkeys(targetValidatorsInfo);

      // 3. Collect consolidation data
      const consolidationContract = getValidatorConsolidationRequestsContract();
      const totalBalance = sourceValidatorsInfo.data.reduce(
        (sum, validator) => sum + Number(validator.balance),
        0,
      );
      const feePerConsolidationRequest = await callReadMethodSilent(
        consolidationContract,
        'getConsolidationRequestFee',
      );
      const totalFee =
        (feePerConsolidationRequest *
          BigInt(sourcePubkeysFlat.length) *
          (100n + FEE_INCREASE_FACTOR)) /
        100n;
      const accountWithDelegateedValidatorConsolidationRequestsContract =
        getAccountWithDelegatedValidatorConsolidationRequestsContract(
          account.address,
        );

      // 4. Request consolidation
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

      // 5. Revoke authorization
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
    },
  );

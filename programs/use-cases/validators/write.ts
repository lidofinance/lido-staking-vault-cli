import {
  stringTo2dArray,
  stringToAddress,
  stringToArray,
  callWriteMethodWithReceipt,
  callReadMethodSilent,
  fetchValidatorInfo,
  finalityCheckpoints,
  logInfo,
} from 'utils';
import { validators } from './main.js';
import { Address, Hex, zeroAddress } from 'viem';
import {
  getAccountWithDelegatedValidatorConsolidationRequestsContract,
  getValidatorConsolidationRequestsContract,
} from 'contracts/validator-consolidation-requests.js';
import { getAccount, getPublicClient, getWalletWithAccount } from 'providers';
import { ValidatorInfo } from 'utils/fetchCL.js';
import assert from 'assert';

const feeIncreaseFactor = 20n;

const validatorsWrite = validators
  .command('write')
  .aliases(['w'])
  .description('validators write commands');

validatorsWrite
  .command('eoa')
  .description('consolidate validators')
  .argument(
    '<source_pubkeys>',
    '2D array of source validator pubkeys: each inner list will be consolidated into a single target validator',
    stringTo2dArray,
  )
  .argument(
    '<target_pubkeys>',
    'List of target validator public keys to consolidate into. One target pubkey per group of source pubkeys',
    stringToArray,
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
      const sourceValidatorsInfo = await fetchValidatorInfo(sourcePubkeysFlat);
      await checkSourcePubkeys(sourceValidatorsInfo, finalizedEpoch);

      // 2. Check target pubkeys
      const targetValidatorsInfo = await fetchValidatorInfo(targetPubkeys);
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
          (100n + feeIncreaseFactor)) /
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
        chain: null,
        to: zeroAddress,
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

const checkSourcePubkeys = async (
  sourceValidatorsInfo: ValidatorInfo,
  finalizedEpoch: number,
) => {
  const notActiveValidators = sourceValidatorsInfo.data.filter(
    (validator) => validator.status !== 'active_ongoing',
  );
  assert(
    notActiveValidators.length === 0,
    'All source pubkeys must be active. Wrong pubkeys:' +
      notActiveValidators.map((v) => v.validator.pubkey).join(', '),
  );

  const wrongWCSourceValidators = sourceValidatorsInfo.data.filter(
    (validator) =>
      validator.validator.withdrawal_credentials.startsWith('0x00'),
  );
  assert(
    wrongWCSourceValidators.length === 0,
    'All source pubkeys must have a withdrawal credentials starting with 0x01 or 0x02. Wrong pubkeys:' +
      wrongWCSourceValidators.map((v) => v.validator.pubkey).join(', '),
  );

  const sourceValidatorsWithLess256Epochs = sourceValidatorsInfo.data.filter(
    (validator) =>
      finalizedEpoch - Number(validator.validator.activation_epoch) < 256,
  );
  assert(
    sourceValidatorsWithLess256Epochs.length === 0,
    'All source pubkeys must have an activation epoch less than the finalized epoch by at least 256 epochs. Wrong pubkeys:' +
      sourceValidatorsWithLess256Epochs
        .map((v) => v.validator.pubkey)
        .join(', '),
  );
};

const checkTargetPubkeys = async (targetValidatorsInfo: ValidatorInfo) => {
  const notActiveTargetValidators = targetValidatorsInfo.data.filter(
    (validator) => validator.status !== 'active_ongoing',
  );
  assert(
    notActiveTargetValidators.length === 0,
    'All target pubkeys must be active. Wrong pubkeys:' +
      notActiveTargetValidators.map((v) => v.validator.pubkey).join(', '),
  );

  const wrongWCTargetValidators = targetValidatorsInfo.data.filter(
    (validator) =>
      !validator.validator.withdrawal_credentials.startsWith('0x02'),
  );
  assert(
    wrongWCTargetValidators.length === 0,
    'All target pubkeys must have a withdrawal credentials starting with 0x02. Wrong pubkeys:' +
      wrongWCTargetValidators.map((v) => v.validator.pubkey).join(', '),
  );
};

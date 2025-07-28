import {
  stringTo2dArray,
  stringToAddress,
  stringToArray,
  callWriteMethodWithReceipt,
  callReadMethodSilent,
  fetchValidatorInfo,
  finalityCheckpoints,
} from 'utils';
import { validators } from './main.js';
import { Address, Hex } from 'viem';
import {
  getAccountWithDelegatedValidatorConsolidationRequestsContract,
  getValidatorConsolidationRequestsContract,
} from 'contracts/validator-consolidation-requests.js';
import { getAccount, getWalletWithAccount } from 'providers';
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
      const finalityCheckpointsInfo = await finalityCheckpoints();
      const finalizedEpoch = Number(
        finalityCheckpointsInfo.data.finalized.epoch,
      );

      // 1. check source pubkeys
      const sourcePubkeysFlat = sourcePubkeys.flat();
      const sourceValidatorsInfo = await fetchValidatorInfo(sourcePubkeysFlat);
      await checkSourcePubkeys(sourceValidatorsInfo, finalizedEpoch);

      // 2. check target pubkeys
      const targetValidatorsInfo = await fetchValidatorInfo(targetPubkeys);
      await checkTargetPubkeys(targetValidatorsInfo);

      // 3. Request consolidation
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
      const walletClient = getWalletWithAccount();

      const account = getAccount();
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
      await callWriteMethodWithReceipt({
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

import {
  stringTo2dArray,
  stringToAddress,
  stringToHexArray,
  fetchValidatorsInfo,
  finalityCheckpoints,
  checkSourceValidators,
  checkTargetValidators,
  callReadMethod,
  callWriteMethodWithReceipt,
  logInfo,
} from 'utils';
import { consolidation } from './main.js';
import { Address, custom, createWalletClient, Hex, hexToBigInt, zeroAddress } from 'viem';
import { checkPubkeys } from 'utils/pubkeys-checks.js';
import {
  revokeDelegate,
  requestConsolidation,
} from 'features/consolidation.js';
import { getDashboardContract, getVaultHubContract } from 'contracts';
import { getAccount, getPublicClient, getWalletWithAccount, getWalletConnectClient } from 'providers';
import { getChain } from 'configs/deployed.js';

const CONSOLIDATION_REQUEST_PREDEPLOY_ADDRESS =
  '0x0000BBdDc7CE488642fb579F8B00f3a590007251';

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
      // 0. Input validation
      const sourcePubkeysFlat = sourcePubkeys.flat();
      checkPubkeys(sourcePubkeysFlat);
      checkPubkeys(targetPubkeys);
      if (sourcePubkeys.length !== targetPubkeys.length) {
        throw new Error(
          'sourcePubkeys and targetPubkeys must have the same length',
        );
      }
      if (refundRecipient === zeroAddress) {
        throw new Error('refundRecipient must be non-zero address');
      }
      if (stakingVault === zeroAddress) {
        throw new Error('stakingVault must be non-zero address');
      }

      // 1. Check source validators
      const finalityCheckpointsInfo = await finalityCheckpoints();
      const finalizedEpoch = Number(
        finalityCheckpointsInfo.data.finalized.epoch,
      );
      const sourceValidatorsInfo = await fetchValidatorsInfo(sourcePubkeysFlat);
      await checkSourceValidators(sourceValidatorsInfo, finalizedEpoch);

      // 2. Check target validators
      const targetValidatorsInfo = await fetchValidatorsInfo(targetPubkeys);
      await checkTargetValidators(targetValidatorsInfo);

      await requestConsolidation(
        sourcePubkeys,
        targetPubkeys,
        refundRecipient,
        stakingVault,
        sourceValidatorsInfo,
      );
      await revokeDelegate();
    },
  );

consolidationWrite
  .command('eoa-revoke-delegate')
  .description('Revoke delegate for the EOA using EIP-7702')
  .action(async () => revokeDelegate());

consolidationWrite
  .command('eoa-transactions')
  .description(
    'Make separate consolidation requests for each source pubkey, increase rewards adjustment',
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
  .argument('<staking_vault>', 'staking vault address', stringToAddress)
  .action(
    async (
      sourcePubkeys: Hex[][],
      targetPubkeys: Hex[],
      stakingVault: Address,
    ) => {
      const publicClient = getPublicClient();
      const walletClient = getWalletWithAccount();
      const account = getAccount();

      // 0. Input validation
      const sourcePubkeysFlat = sourcePubkeys.flat();
      checkPubkeys(sourcePubkeysFlat);
      checkPubkeys(targetPubkeys);
      if (sourcePubkeys.length !== targetPubkeys.length) {
        throw new Error(
          'sourcePubkeys and targetPubkeys must have the same length',
        );
      }
      if (stakingVault === zeroAddress) {
        throw new Error('stakingVault must be non-zero address');
      }

      // 1. Check source validators
      const finalityCheckpointsInfo = await finalityCheckpoints();
      const finalizedEpoch = Number(
        finalityCheckpointsInfo.data.finalized.epoch,
      );
      const sourceValidatorsInfo = await fetchValidatorsInfo(sourcePubkeysFlat);
      await checkSourceValidators(sourceValidatorsInfo, finalizedEpoch);

      // 2. Check target validators
      const targetValidatorsInfo = await fetchValidatorsInfo(targetPubkeys);
      await checkTargetValidators(targetValidatorsInfo);

      // 3. Onchain checks
      const vaultHub = await getVaultHubContract();
      const vaultConnection = await callReadMethod(
        vaultHub,
        'vaultConnection',
        [stakingVault],
      );
      if (
        vaultConnection.vaultIndex === 0n ||
        vaultConnection.pendingDisconnect
      ) {
        throw new Error('Vault is not connected or is pending disconnect');
      }

      // 4. Get fee per request
      const { data } = await publicClient.call({
        to: CONSOLIDATION_REQUEST_PREDEPLOY_ADDRESS,
        data: '0x',
        blockTag: 'latest',
      });
      if (!data) throw new Error('Fee read returned empty data');
      const feePerRequest = hexToBigInt(data);

      // 5. Request consolidation
      for (const [pubkeyIndex, targetPubkey] of targetPubkeys.entries()) {
        const sourcePubkeysGroup = sourcePubkeys[pubkeyIndex] ?? [];
        for (const sourcePubkey of sourcePubkeysGroup) {
          if (sourcePubkey == null || targetPubkey == null) {
            throw new Error('sourcePubkey and targetPubkey must be defined');
          }

          const calldata =
            `0x${sourcePubkey.slice(2)}${targetPubkey.slice(2)}` as Hex;
          const txHash = await walletClient.sendTransaction({
            to: CONSOLIDATION_REQUEST_PREDEPLOY_ADDRESS,
            data: calldata,
            value: feePerRequest,
            account: account,
            chain: walletClient.chain,
          });

          logInfo('consolidation request tx hash:', txHash);

          const txReceipt = await publicClient.waitForTransactionReceipt({
            hash: txHash,
          });
          logInfo('consolidation request tx receipt:', txReceipt);
        }
      }

      // 6. Increase rewards adjustment
      const dashboardContract = getDashboardContract(vaultConnection.owner);
      const totalBalance = sourceValidatorsInfo.data.reduce(
        (sum, validator) => sum + Number(validator.balance),
        0,
      );
      if (totalBalance > 0) {
        await callWriteMethodWithReceipt({
          contract: dashboardContract,
          methodName: 'increaseRewardsAdjustment',
          payload: [BigInt(totalBalance)],
        });
      }
    },
  );

  consolidationWrite
  .command('eoa-sendcalls')
  .description(
    'Make separate consolidation requests for each source pubkey, increase rewards adjustment',
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
  .argument('<staking_vault>', 'staking vault address', stringToAddress)
  .action(
    async (
      sourcePubkeys: Hex[][],
      targetPubkeys: Hex[],
      stakingVault: Address,
    ) => {
      const publicClient = getPublicClient();
      //const walletClient = getWalletWithAccount();
      const account = getAccount();

      const walletClient = await getWalletConnectClient();

      // 0. Input validation
      const sourcePubkeysFlat = sourcePubkeys.flat();
      checkPubkeys(sourcePubkeysFlat);
      checkPubkeys(targetPubkeys);
      if (sourcePubkeys.length !== targetPubkeys.length) {
        throw new Error(
          'sourcePubkeys and targetPubkeys must have the same length',
        );
      }
      if (stakingVault === zeroAddress) {
        throw new Error('stakingVault must be non-zero address');
      }

      // Get fee per request first
      const { data } = await publicClient.call({
        to: CONSOLIDATION_REQUEST_PREDEPLOY_ADDRESS,
        data: '0x',
        blockTag: 'latest',
      });
      if (!data) throw new Error('Fee read returned empty data');
      const feePerRequest = hexToBigInt(data);


      const calls = [];

      for (const [pubkeyIndex, targetPubkey] of targetPubkeys.entries()) {
        const sourcePubkeysGroup = sourcePubkeys[pubkeyIndex] ?? [];
        for (const sourcePubkey of sourcePubkeysGroup) {
          if (sourcePubkey == null || targetPubkey == null) {
            throw new Error('sourcePubkey and targetPubkey must be defined');
          }
          const calldata =
            `0x${sourcePubkey.slice(2)}${targetPubkey.slice(2)}` as Hex;
          calls.push({
            to: CONSOLIDATION_REQUEST_PREDEPLOY_ADDRESS as Address,
            data: calldata,
            value: feePerRequest,
          });
        }
      }
      logInfo('calls:', calls);

      const result = await walletClient.sendCalls({
        account: walletClient.account,
        calls: calls,
        experimental_fallback: true,
      });
      logInfo('sendCalls result:', result);
    },
  );
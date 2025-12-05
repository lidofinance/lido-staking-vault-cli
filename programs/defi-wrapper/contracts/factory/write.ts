import { Address, parseEther, fromHex } from 'viem';
import { Option } from 'commander';

import {
  logInfo,
  logResult,
  logError,
  getCommandsJson,
  stringToAddress,
  callWriteMethodWithReceipt,
  confirmOperation,
  stringToNumber,
} from 'utils';
import { getFactoryContract } from 'contracts/defi-wrapper/index.js';
import {
  getCreatePoolEventData,
  getFinalizePoolEventData,
  getAddress,
  getNodeOperatorFeeRate,
  getConfirmExpiry,
  getMinWithdrawalDelayTime,
  getPoolTokenName,
  getPoolTokenSymbol,
  getMinDelaySeconds,
  getReserveRatioGapBP,
} from 'features';

import { factory } from './main.js';

type VaultConfig = {
  nodeOperator: Address; // Address of the node operator managing the vault
  nodeOperatorManager: Address; // Address authorized to manage node operator settings
  nodeOperatorFeeBP: bigint; // Node operator fee in basis points (1 BP = 0.01%)
  confirmExpiry: bigint; // Time period for confirmation expiry
};

type TimelockConfig = {
  minDelaySeconds: bigint; // Minimum delay before executing queued operations
  proposer: Address; // Address authorized to propose operations
  executor: Address; // Address authorized to execute operations
};

type CommonPoolConfig = {
  minWithdrawalDelayTime: bigint; // Minimum delay time for processing withdrawals
  name: string; // ERC20 token name for the pool shares
  symbol: string; // ERC20 token symbol for the pool shares
  emergencyCommittee: Address; // Address of the emergency committee for pausing operations
};

const factoryWrite = factory
  .command('write')
  .alias('w')
  .description('write commands');

factoryWrite.addOption(new Option('-cmd2json'));
factoryWrite.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(factoryWrite));
  process.exit();
});

factoryWrite
  .command('create-pool-ggv')
  .description('initiates deployment of a GGV strategy pool')
  .argument('<address>', 'factory address', stringToAddress)
  .option('-no, --nodeOperator <nodeOperator>', 'node operator address')
  .option(
    '-nom, --nodeOperatorManager <nodeOperatorManager>',
    'node operator manager address',
  )
  .option(
    '-nof , --nodeOperatorFeeRate <nodeOperatorFeeRate>',
    'Node operator fee rate in basis points, for e.g. 100 == 1%',
    stringToNumber,
  )
  .option(
    '-ce, --confirmExpiry <confirmExpiry>',
    'confirm expiry in seconds',
    stringToNumber,
  )
  .option(
    '-md, --minDelaySeconds <minDelaySeconds>',
    'minimum delay in seconds',
    stringToNumber,
  )
  .option(
    '-mwd, --minWithdrawalDelayTime <minWithdrawalDelayTime>',
    'minimum withdrawal delay time in seconds',
    stringToNumber,
  )
  .option('-n, --name <name>', 'name of the pool shares')
  .option('-s, --symbol <symbol>', 'symbol of the pool shares')
  .option('-p, --proposer <proposer>', 'proposer address', stringToAddress)
  .option('-e, --executor <executor>', 'executor address', stringToAddress)
  .option(
    '-ec, --emergencyCommittee <emergencyCommittee>',
    'emergency committee address',
    stringToAddress,
  )
  .option(
    '-rrg, --reserveRatioGapBP <reserveRatioGapBP>',
    'reserve ratio gap in basis points',
    stringToNumber,
  )
  .action(
    async (
      address: Address,
      {
        nodeOperator,
        nodeOperatorManager,
        nodeOperatorFeeRate,
        confirmExpiry,
        minDelaySeconds,
        reserveRatioGapBP,
        proposer,
        executor,
        emergencyCommittee,
        minWithdrawalDelayTime,
        name,
        symbol,
      }: {
        nodeOperator: Address;
        nodeOperatorManager: Address;
        nodeOperatorFeeRate: number;
        confirmExpiry: number;
        minDelaySeconds: number;
        reserveRatioGapBP: number;
        emergencyCommittee: Address;
        proposer: Address;
        executor: Address;
        minWithdrawalDelayTime: number;
        name: string;
        symbol: string;
      },
    ) => {
      const contract = await getFactoryContract(address);

      const nodeOperatorAddress = await getAddress(
        nodeOperator,
        'Node Operator',
      );
      const nodeOperatorManagerAddress = await getAddress(
        nodeOperatorManager,
        'Node Operator Manager',
      );

      const nodeOperatorFeeRateValue =
        await getNodeOperatorFeeRate(nodeOperatorFeeRate);
      const confirmExpiryValue = await getConfirmExpiry(confirmExpiry);

      const minDelaySecondsValue = await getMinDelaySeconds(minDelaySeconds);
      const proposerAddress = await getAddress(proposer, 'Proposer');
      const executorAddress = await getAddress(executor, 'Executor');
      const emergencyCommitteeAddress = await getAddress(
        emergencyCommittee,
        'Emergency Committee',
      );

      const minWithdrawalDelayTimeValue = await getMinWithdrawalDelayTime(
        minWithdrawalDelayTime,
      );

      const nameValue = await getPoolTokenName(name);
      const symbolValue = await getPoolTokenSymbol(symbol);

      const vaultConfig: VaultConfig = {
        nodeOperator: nodeOperatorAddress,
        nodeOperatorManager: nodeOperatorManagerAddress,
        nodeOperatorFeeBP: BigInt(nodeOperatorFeeRateValue),
        confirmExpiry: BigInt(confirmExpiryValue),
      };
      const timelockConfig: TimelockConfig = {
        minDelaySeconds: BigInt(minDelaySecondsValue),
        proposer: proposerAddress,
        executor: executorAddress,
      };
      const commonPoolConfig: CommonPoolConfig = {
        minWithdrawalDelayTime: BigInt(minWithdrawalDelayTimeValue),
        name: nameValue,
        symbol: symbolValue,
        emergencyCommittee: emergencyCommitteeAddress,
      };

      const reserveRatioGapBPValue =
        await getReserveRatioGapBP(reserveRatioGapBP);

      const confirmationMessage = `Are you sure you want to create a new pool GGV strategy with a configured wrapper?\n
        nodeOperator: ${nodeOperatorAddress}
        nodeOperatorManager: ${nodeOperatorManagerAddress}
        nodeOperatorFeeBP: ${nodeOperatorFeeRateValue}
        confirmExpiry: ${confirmExpiryValue}
        minDelaySeconds: ${minDelaySecondsValue}
        proposer: ${proposerAddress}
        executor: ${executorAddress}
        minWithdrawalDelayTime: ${minWithdrawalDelayTimeValue}
        name: ${nameValue}
        symbol: ${symbolValue}
        reserveRatioGapBP: ${reserveRatioGapBPValue}\n`;
      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      const result = await callWriteMethodWithReceipt({
        contract,
        methodName: 'createPoolGGVStart',
        payload: [
          vaultConfig,
          timelockConfig,
          commonPoolConfig,
          BigInt(reserveRatioGapBPValue),
        ],
        value: parseEther('1'), // TODO: from contract
      });

      if (!result.receipt || !result.tx) {
        logInfo('Transaction has been sent');
        return;
      }

      const eventData = await getCreatePoolEventData(result.receipt, result.tx);

      logInfo('Pool Creation Started');
      logResult({
        data: [
          ['Sender', eventData.sender],
          ['Strategy Factory', eventData.strategyFactory],
          ['Strategy Deploy Bytes', eventData.strategyDeployBytes],
          ['Finish Deadline', eventData.finishDeadline],
          ['Transaction Hash', result.tx],
          ['Block Number', eventData.blockNumber],
        ],
      });

      logInfo('Vault Config');
      logResult({
        data: [
          ['Node Operator', eventData.vaultConfig?.nodeOperator],
          ['Node Operator Manager', eventData.vaultConfig?.nodeOperatorManager],
          ['Node Operator Fee BP', eventData.vaultConfig?.nodeOperatorFeeBP],
          ['Confirm Expiry', eventData.vaultConfig?.confirmExpiry],
        ],
      });

      logInfo('Common Pool Config');
      logResult({
        data: [
          [
            'Min Withdrawal Delay Time',
            eventData.commonPoolConfig?.minWithdrawalDelayTime,
          ],
          ['Name', eventData.commonPoolConfig?.name],
          ['Symbol', eventData.commonPoolConfig?.symbol],
        ],
      });

      logInfo('Auxiliary Config');
      logResult({
        data: [
          ['Allowlist Enabled', eventData.auxiliaryConfig?.allowlistEnabled],
          ['Minting Enabled', eventData.auxiliaryConfig?.mintingEnabled],
          [
            'Reserve Ratio Gap BP',
            eventData.auxiliaryConfig?.reserveRatioGapBP,
          ],
        ],
      });

      logInfo('Timelock Config');
      logResult({
        data: [
          ['Min Delay Seconds', eventData.timelockConfig?.minDelaySeconds],
          ['Proposer', eventData.timelockConfig?.proposer],
          ['Executor', eventData.timelockConfig?.executor],
        ],
      });

      logInfo('Intermediate');
      logResult({
        data: [
          ['Dashboard', eventData.intermediate?.dashboard],
          ['Pool Proxy', eventData.intermediate?.poolProxy],
          [
            'Withdrawal Queue Proxy',
            eventData.intermediate?.withdrawalQueueProxy,
          ],
          ['Timelock', eventData.intermediate?.timelock],
        ],
      });

      if (
        !eventData.auxiliaryConfig ||
        !eventData.strategyFactory ||
        !eventData.strategyDeployBytes ||
        !eventData.intermediate
      ) {
        logError('Missing required data for pool creation finalize');
        return;
      }

      logInfo('Pool Creation Finalize');

      const finalizeResult = await callWriteMethodWithReceipt({
        contract,
        methodName: 'createPoolFinish',
        payload: [
          vaultConfig,
          timelockConfig,
          commonPoolConfig,
          eventData.auxiliaryConfig,
          eventData.strategyFactory,
          eventData.strategyDeployBytes,
          eventData.intermediate,
        ],
      });

      if (!finalizeResult.receipt || !finalizeResult.tx) {
        logInfo('Transaction has been sent');
        return;
      }

      const finalizeEventData = await getFinalizePoolEventData(
        finalizeResult.receipt,
        finalizeResult.tx,
      );

      const poolType =
        finalizeEventData.poolType &&
        fromHex(finalizeEventData.poolType, 'string').replace(/\W/g, '');

      logInfo('Pool Creation Finalized');
      logResult({
        data: [
          ['Vault', finalizeEventData.vault],
          ['Pool', finalizeEventData.pool],
          ['Pool Type', poolType],
          ['Withdrawal Queue', finalizeEventData.withdrawalQueue],
          ['Strategy Factory', finalizeEventData.strategyFactory],
          ['Strategy Deploy Bytes', finalizeEventData.strategyDeployBytes],
          ['Strategy', finalizeEventData.strategy],
          ['Transaction Hash', finalizeResult.tx],
          ['Block Number', finalizeEventData.blockNumber],
        ],
      });

      logInfo('UI Environment Variables:');
      logResult({
        data: [
          ['VITE_POOL_TYPE', poolType],
          ['VITE_POOL_ADDRESS', finalizeEventData.pool],
          ['VITE_STRATEGY_ADDRESS', finalizeEventData.strategy],
        ],
      });
    },
  );

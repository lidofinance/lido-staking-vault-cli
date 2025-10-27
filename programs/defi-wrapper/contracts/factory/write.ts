import { Option } from 'commander';

import {
  logInfo,
  logResult,
  getCommandsJson,
  stringToAddress,
  callWriteMethodWithReceipt,
  confirmOperation,
  stringToBigInt,
  stringToNumber,
} from 'utils';
import { getFactoryContract } from 'contracts/defi-wrapper/index.js';
import { getCreateVaultEventData } from 'features';

import { factory } from './main.js';
import { Address } from 'viem';

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
  .command('create-vault-with-configured-wrapper')
  .description('create a new vault with a configured wrapper')
  .argument('<address>', 'factory address', stringToAddress)
  .argument('<nodeOperator>', 'node operator address', stringToAddress)
  .argument(
    '<nodeOperatorManager>',
    'node operator manager address',
    stringToAddress,
  )
  .argument(
    '<nodeOperatorFeeBP>',
    'node operator fee basis points',
    stringToBigInt,
  )
  .argument('<confirmExpiry>', 'confirm expiry', stringToBigInt)
  .argument('<maxFinalizationTime>', 'max finalization time', stringToBigInt)
  .argument(
    '<minWithdrawalDelayTime>',
    'min withdrawal delay time',
    stringToBigInt,
  )
  .argument('<configuration>', 'configuration', stringToNumber)
  .argument('<strategy>', 'strategy address', stringToAddress)
  .argument('<allowlistEnabled>', 'allowlist enabled', Boolean)
  .argument(
    '<reserveRatioGapBP>',
    'reserve ratio gap basis points',
    stringToBigInt,
  )
  .argument('<timelockExecutor>', 'timelock executor address', stringToAddress)
  .action(
    async (
      address: Address,
      nodeOperator: Address,
      nodeOperatorManager: Address,
      nodeOperatorFeeBP: bigint,
      confirmExpiry: bigint,
      maxFinalizationTime: bigint,
      minWithdrawalDelayTime: bigint,
      configuration: number,
      strategy: Address,
      allowlistEnabled: boolean,
      reserveRatioGapBP: bigint,
      timelockExecutor: Address,
    ) => {
      const contract = getFactoryContract(address);

      const confirmationMessage = `Are you sure you want to create a new vault with a configured wrapper?\n
      nodeOperator: ${nodeOperator}
      nodeOperatorManager: ${nodeOperatorManager}
      nodeOperatorFeeBP: ${nodeOperatorFeeBP}
      confirmExpiry: ${confirmExpiry}
      maxFinalizationTime: ${maxFinalizationTime}
      minWithdrawalDelayTime: ${minWithdrawalDelayTime}
      configuration: ${configuration}
      strategy: ${strategy}
      allowlistEnabled: ${allowlistEnabled}
      reserveRatioGapBP: ${reserveRatioGapBP}
      timelockExecutor: ${timelockExecutor}\n`;
      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      const result = await callWriteMethodWithReceipt({
        contract,
        methodName: 'createVaultWithConfiguredWrapper',
        payload: [
          nodeOperator,
          nodeOperatorManager,
          nodeOperatorFeeBP,
          confirmExpiry,
          maxFinalizationTime,
          minWithdrawalDelayTime,
          configuration,
          strategy,
          allowlistEnabled,
          reserveRatioGapBP,
          timelockExecutor,
        ],
      });

      const eventData = await getCreateVaultEventData(
        result.receipt,
        result.tx,
      );

      logResult({
        data: [
          ['Vault Address', eventData.vault],
          ['Pool Address', eventData.pool],
          ['Withdrawal Queue Address', eventData.withdrawalQueue],
          ['Strategy Address', eventData.strategy],
          ['Configuration', eventData.configuration],
          ['Transaction Hash', result.tx],
          ['Block Number', eventData.blockNumber],
        ],
      });
    },
  );

factoryWrite
  .command('create-vault-with-no-minting-no-strategy')
  .description('create a new vault with no minting no strategy')
  .argument('<address>', 'factory address', stringToAddress)
  .argument('<nodeOperator>', 'node operator address', stringToAddress)
  .argument(
    '<nodeOperatorManager>',
    'node operator manager address',
    stringToAddress,
  )
  .argument(
    '<nodeOperatorFeeBP>',
    'node operator fee basis points',
    stringToBigInt,
  )
  .argument('<confirmExpiry>', 'confirm expiry', stringToBigInt)
  .argument('<maxFinalizationTime>', 'max finalization time', stringToBigInt)
  .argument(
    '<minWithdrawalDelayTime>',
    'min withdrawal delay time',
    stringToBigInt,
  )
  .argument('<allowlistEnabled>', 'allowlist enabled', Boolean)
  .option('-te, --timelockExecutor', 'timelockExecutor', stringToAddress)
  .action(
    async (
      address: Address,
      nodeOperator: Address,
      nodeOperatorManager: Address,
      nodeOperatorFeeBP: bigint,
      confirmExpiry: bigint,
      maxFinalizationTime: bigint,
      minWithdrawalDelayTime: bigint,
      allowlistEnabled: boolean,
      { timelockExecutor }: { timelockExecutor: Address },
    ) => {
      const contract = getFactoryContract(address);

      const confirmationMessage = `Are you sure you want to create a new vault with no minting no strategy?\n
      nodeOperator: ${nodeOperator}
      nodeOperatorManager: ${nodeOperatorManager}
      nodeOperatorFeeBP: ${nodeOperatorFeeBP}
      confirmExpiry: ${confirmExpiry}
      maxFinalizationTime: ${maxFinalizationTime}
      minWithdrawalDelayTime: ${minWithdrawalDelayTime}
      allowlistEnabled: ${allowlistEnabled}
      timelockExecutor: ${timelockExecutor ?? 'undefined'}\n`;
      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      const result = await callWriteMethodWithReceipt({
        contract,
        methodName: 'createVaultWithNoMintingNoStrategy',
        payload: [
          nodeOperator,
          nodeOperatorManager,
          nodeOperatorFeeBP,
          confirmExpiry,
          maxFinalizationTime,
          minWithdrawalDelayTime,
          allowlistEnabled,
          timelockExecutor ?? undefined,
        ],
      });

      const eventData = await getCreateVaultEventData(
        result.receipt,
        result.tx,
      );

      logResult({
        data: [
          ['Vault Address', eventData.vault],
          ['Pool Address', eventData.pool],
          ['Withdrawal Queue Address', eventData.withdrawalQueue],
          ['Strategy Address', eventData.strategy],
          ['Configuration', eventData.configuration],
          ['Transaction Hash', result.tx],
          ['Block Number', eventData.blockNumber],
        ],
      });
    },
  );

factoryWrite
  .command('create-vault-with-minting-no-strategy')
  .description('create a new vault with minting no strategy')
  .argument('<address>', 'factory address', stringToAddress)
  .argument('<nodeOperator>', 'node operator address', stringToAddress)
  .argument(
    '<nodeOperatorManager>',
    'node operator manager address',
    stringToAddress,
  )
  .argument(
    '<nodeOperatorFeeBP>',
    'node operator fee basis points',
    stringToBigInt,
  )
  .argument('<confirmExpiry>', 'confirm expiry', stringToBigInt)
  .argument('<maxFinalizationTime>', 'max finalization time', stringToBigInt)
  .argument(
    '<minWithdrawalDelayTime>',
    'min withdrawal delay time',
    stringToBigInt,
  )
  .argument('<allowlistEnabled>', 'allowlist enabled', Boolean)
  .argument(
    '<reserveRatioGapBP>',
    'reserve ratio gap basis points',
    stringToBigInt,
  )
  .option('-te, --timelockExecutor', 'timelockExecutor', stringToAddress)
  .action(
    async (
      address: Address,
      nodeOperator: Address,
      nodeOperatorManager: Address,
      nodeOperatorFeeBP: bigint,
      confirmExpiry: bigint,
      maxFinalizationTime: bigint,
      minWithdrawalDelayTime: bigint,
      allowlistEnabled: boolean,
      reserveRatioGapBP: bigint,
      { timelockExecutor }: { timelockExecutor: Address },
    ) => {
      const contract = getFactoryContract(address);

      const confirmationMessage = `Are you sure you want to create a new vault with minting no strategy?\n
      nodeOperator: ${nodeOperator}
      nodeOperatorManager: ${nodeOperatorManager}
      nodeOperatorFeeBP: ${nodeOperatorFeeBP}
      confirmExpiry: ${confirmExpiry}
      maxFinalizationTime: ${maxFinalizationTime}
      minWithdrawalDelayTime: ${minWithdrawalDelayTime}
      allowlistEnabled: ${allowlistEnabled}
      reserveRatioGapBP: ${reserveRatioGapBP}
      timelockExecutor: ${timelockExecutor ?? 'undefined'}\n`;
      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      const result = await callWriteMethodWithReceipt({
        contract,
        methodName: 'createVaultWithMintingNoStrategy',
        payload: [
          nodeOperator,
          nodeOperatorManager,
          nodeOperatorFeeBP,
          confirmExpiry,
          maxFinalizationTime,
          minWithdrawalDelayTime,
          allowlistEnabled,
          reserveRatioGapBP,
          timelockExecutor ?? undefined,
        ],
      });

      const eventData = await getCreateVaultEventData(
        result.receipt,
        result.tx,
      );

      logResult({
        data: [
          ['Vault Address', eventData.vault],
          ['Pool Address', eventData.pool],
          ['Withdrawal Queue Address', eventData.withdrawalQueue],
          ['Strategy Address', eventData.strategy],
          ['Configuration', eventData.configuration],
          ['Transaction Hash', result.tx],
          ['Block Number', eventData.blockNumber],
        ],
      });
    },
  );

factoryWrite
  .command('create-vault-with-loop-strategy')
  .description('create a new vault with loop strategy')
  .argument('<address>', 'factory address', stringToAddress)
  .argument('<nodeOperator>', 'node operator address', stringToAddress)
  .argument(
    '<nodeOperatorManager>',
    'node operator manager address',
    stringToAddress,
  )
  .argument(
    '<nodeOperatorFeeBP>',
    'node operator fee basis points',
    stringToBigInt,
  )
  .argument('<confirmExpiry>', 'confirm expiry', stringToBigInt)
  .argument('<maxFinalizationTime>', 'max finalization time', stringToBigInt)
  .argument(
    '<minWithdrawalDelayTime>',
    'min withdrawal delay time',
    stringToBigInt,
  )
  .argument('<allowlistEnabled>', 'allowlist enabled', Boolean)
  .argument(
    '<reserveRatioGapBP>',
    'reserve ratio gap basis points',
    stringToBigInt,
  )
  .argument('<loops>', 'loops', stringToBigInt)
  .option('-te, --timelockExecutor', 'timelockExecutor', stringToAddress)
  .action(
    async (
      address: Address,
      nodeOperator: Address,
      nodeOperatorManager: Address,
      nodeOperatorFeeBP: bigint,
      confirmExpiry: bigint,
      maxFinalizationTime: bigint,
      minWithdrawalDelayTime: bigint,
      allowlistEnabled: boolean,
      reserveRatioGapBP: bigint,
      loops: bigint,
      { timelockExecutor }: { timelockExecutor: Address },
    ) => {
      const contract = getFactoryContract(address);

      const confirmationMessage = `Are you sure you want to create a new vault with loop strategy?\n
      nodeOperator: ${nodeOperator}
      nodeOperatorManager: ${nodeOperatorManager}
      nodeOperatorFeeBP: ${nodeOperatorFeeBP}
      confirmExpiry: ${confirmExpiry}
      maxFinalizationTime: ${maxFinalizationTime}
      minWithdrawalDelayTime: ${minWithdrawalDelayTime}
      allowlistEnabled: ${allowlistEnabled}
      reserveRatioGapBP: ${reserveRatioGapBP}
      loops: ${loops}
      timelockExecutor: ${timelockExecutor ?? 'undefined'}\n`;
      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      const result = await callWriteMethodWithReceipt({
        contract,
        methodName: 'createVaultWithLoopStrategy',
        payload: [
          nodeOperator,
          nodeOperatorManager,
          nodeOperatorFeeBP,
          confirmExpiry,
          maxFinalizationTime,
          minWithdrawalDelayTime,
          allowlistEnabled,
          reserveRatioGapBP,
          loops,
          timelockExecutor ?? undefined,
        ],
      });

      const eventData = await getCreateVaultEventData(
        result.receipt,
        result.tx,
      );

      logResult({
        data: [
          ['Vault Address', eventData.vault],
          ['Pool Address', eventData.pool],
          ['Withdrawal Queue Address', eventData.withdrawalQueue],
          ['Strategy Address', eventData.strategy],
          ['Configuration', eventData.configuration],
          ['Transaction Hash', result.tx],
          ['Block Number', eventData.blockNumber],
        ],
      });
    },
  );

factoryWrite
  .command('create-vault-with-ggv-strategy')
  .description('create a new vault with ggv strategy')
  .argument('<address>', 'factory address', stringToAddress)
  .argument('<nodeOperator>', 'node operator address', stringToAddress)
  .argument(
    '<nodeOperatorManager>',
    'node operator manager address',
    stringToAddress,
  )
  .argument(
    '<nodeOperatorFeeBP>',
    'node operator fee basis points',
    stringToBigInt,
  )
  .argument('<confirmExpiry>', 'confirm expiry', stringToBigInt)
  .argument('<maxFinalizationTime>', 'max finalization time', stringToBigInt)
  .argument(
    '<minWithdrawalDelayTime>',
    'min withdrawal delay time',
    stringToBigInt,
  )
  .argument('<allowlistEnabled>', 'allowlist enabled', Boolean)
  .argument(
    '<reserveRatioGapBP>',
    'reserve ratio gap basis points',
    stringToBigInt,
  )
  .argument('<teller>', 'teller address', stringToAddress)
  .argument('<boringQueue>', 'boring queue address', stringToAddress)
  .option('-te, --timelockExecutor', 'timelockExecutor', stringToAddress)
  .action(
    async (
      address: Address,
      nodeOperator: Address,
      nodeOperatorManager: Address,
      nodeOperatorFeeBP: bigint,
      confirmExpiry: bigint,
      maxFinalizationTime: bigint,
      minWithdrawalDelayTime: bigint,
      allowlistEnabled: boolean,
      reserveRatioGapBP: bigint,
      teller: Address,
      boringQueue: Address,
      { timelockExecutor }: { timelockExecutor: Address },
    ) => {
      const contract = getFactoryContract(address);

      const confirmationMessage = `Are you sure you want to create a new vault with ggv strategy?\n
      nodeOperator: ${nodeOperator}
      nodeOperatorManager: ${nodeOperatorManager}
      nodeOperatorFeeBP: ${nodeOperatorFeeBP}
      confirmExpiry: ${confirmExpiry}
      maxFinalizationTime: ${maxFinalizationTime}
      minWithdrawalDelayTime: ${minWithdrawalDelayTime}
      allowlistEnabled: ${allowlistEnabled}
      reserveRatioGapBP: ${reserveRatioGapBP}
      teller: ${teller}
      boringQueue: ${boringQueue}
      timelockExecutor: ${timelockExecutor ?? 'undefined'}\n`;
      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      const result = await callWriteMethodWithReceipt({
        contract,
        methodName: 'createVaultWithGGVStrategy',
        payload: [
          nodeOperator,
          nodeOperatorManager,
          nodeOperatorFeeBP,
          confirmExpiry,
          maxFinalizationTime,
          minWithdrawalDelayTime,
          allowlistEnabled,
          reserveRatioGapBP,
          teller,
          boringQueue,
          timelockExecutor ?? undefined,
        ],
      });

      const eventData = await getCreateVaultEventData(
        result.receipt,
        result.tx,
      );

      logResult({
        data: [
          ['Vault Address', eventData.vault],
          ['Pool Address', eventData.pool],
          ['Withdrawal Queue Address', eventData.withdrawalQueue],
          ['Strategy Address', eventData.strategy],
          ['Configuration', eventData.configuration],
          ['Transaction Hash', result.tx],
          ['Block Number', eventData.blockNumber],
        ],
      });
    },
  );

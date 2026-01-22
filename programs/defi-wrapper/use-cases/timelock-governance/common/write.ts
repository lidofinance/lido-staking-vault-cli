import { Option } from 'commander';
import {
  logInfo,
  getCommandsJson,
  stringToAddress,
  callWriteMethodWithReceipt,
  confirmOperation,
  callReadMethodSilent,
  addressPrompt,
  textPrompt,
} from 'utils';
import { common } from './main.js';
import { Address, Hex, stringToHex, isHex } from 'viem';
import { getTimeLockContract } from 'contracts/defi-wrapper/index.js';
import { getPublicClient } from 'providers';

const commonWrite = common
  .command('write')
  .alias('w')
  .description('common timelock write commands');

commonWrite.addOption(new Option('-cmd2json'));
commonWrite.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(commonWrite));
  process.exit();
});

commonWrite
  .command('execute')
  .description('execute a scheduled timelock operation')
  .argument('[timelock]', 'timelock contract address', stringToAddress)
  .argument('[target]', 'target contract address', stringToAddress)
  .argument('[value]', 'value to send (in ETH, default: 0)', (v) =>
    v ? BigInt(v) : 0n,
  )
  .argument('[payload]', 'call data payload (hex)')
  .option(
    '-p, --predecessor <predecessor>',
    'predecessor operation ID (bytes32 hex, default: 0x0)',
  )
  .option('-s, --salt <salt>', 'salt for operation (bytes32 hex, default: 0x0)')
  .action(
    async (
      timelock?: Address,
      target?: Address,
      value?: bigint,
      payloadInput?: string,
      options?: { predecessor?: string; salt?: string },
    ) => {
      // Interactive prompts for missing parameters
      if (!timelock) {
        const timelockPrompt = await addressPrompt(
          'Enter timelock contract address',
          'timelock',
        );
        timelock = timelockPrompt.timelock as Address;
      }

      if (!target) {
        const targetPrompt = await addressPrompt(
          'Enter target contract address',
          'target',
        );
        target = targetPrompt.target as Address;
      }

      const finalValue = value ?? 0n;

      let payload: Hex;
      if (!payloadInput) {
        const payloadPrompt = await textPrompt(
          'Enter call data payload (hex)',
          'payload',
        );
        payloadInput = payloadPrompt.payload as string;
      }

      // Validate and convert to hex - if already hex, use as is
      if (isHex(payloadInput)) {
        payload = payloadInput;
      } else {
        payload = stringToHex(payloadInput);
      }

      const predecessor = options?.predecessor
        ? isHex(options.predecessor)
          ? options.predecessor
          : stringToHex(options.predecessor)
        : ('0x0000000000000000000000000000000000000000000000000000000000000000' as Hex);

      const salt = options?.salt
        ? isHex(options.salt)
          ? options.salt
          : stringToHex(options.salt)
        : ('0x0000000000000000000000000000000000000000000000000000000000000000' as Hex);

      const timelockContract = await getTimeLockContract(timelock);

      // Calculate operation ID to check state
      const operationId = await callReadMethodSilent(
        timelockContract,
        'hashOperation',
        [target, finalValue, payload, predecessor, salt],
      );

      // Check operation state
      const state = await callReadMethodSilent(
        timelockContract,
        'getOperationState',
        [operationId],
      );

      // OperationState: Unset=0, Waiting=1, Ready=2, Done=3
      if (state === 0) {
        logInfo('❌ Operation not found (Unset)');
        return;
      }
      if (state === 3) {
        logInfo('✅ Operation already executed (Done)');
        return;
      }
      if (state === 1) {
        const timestamp = await callReadMethodSilent(
          timelockContract,
          'getTimestamp',
          [operationId],
        );
        const publicClient = await getPublicClient();
        const currentBlock = await publicClient.getBlock({
          blockTag: 'latest',
        });
        const now = currentBlock.timestamp;
        const waitTime = timestamp > now ? timestamp - now : 0n;
        logInfo(
          `⏳ Operation is waiting. Will be ready at timestamp ${timestamp} (in ${waitTime} seconds)`,
        );
        return;
      }

      const confirmationMessage = `Are you sure you want to execute this operation?
Operation ID: ${operationId}
Target: ${target}
Value: ${finalValue} ETH
Payload: ${payload}`;

      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract: timelockContract,
        methodName: 'execute',
        payload: [target, finalValue, payload, predecessor, salt],
        value: finalValue,
      });
    },
  );

commonWrite
  .command('cancel')
  .description('cancel a scheduled timelock operation')
  .argument('[timelock]', 'timelock contract address', stringToAddress)
  .argument('[operationId]', 'operation ID (bytes32 hash)')
  .action(async (timelock?: Address, operationIdInput?: string) => {
    // Interactive prompts for missing parameters
    if (!timelock) {
      const timelockPrompt = await addressPrompt(
        'Enter timelock contract address',
        'timelock',
      );
      timelock = timelockPrompt.timelock as Address;
    }

    let operationId: Hex;
    if (!operationIdInput) {
      const operationIdPrompt = await textPrompt(
        'Enter operation ID (bytes32 hash)',
        'operationId',
      );
      operationIdInput = operationIdPrompt.operationId as string;
    }

    // Validate and convert to hex - if already hex, use as is
    if (isHex(operationIdInput)) {
      operationId = operationIdInput;
    } else {
      operationId = stringToHex(operationIdInput);
    }
    const timelockContract = await getTimeLockContract(timelock);

    // Check operation state
    const state = await callReadMethodSilent(
      timelockContract,
      'getOperationState',
      [operationId],
    );

    if (state === 0) {
      logInfo('❌ Operation not found (Unset)');
      return;
    }
    if (state === 3) {
      logInfo('❌ Cannot cancel: operation already executed (Done)');
      return;
    }

    const confirmationMessage = `Are you sure you want to cancel this operation?
Operation ID: ${operationId}`;

    const confirm = await confirmOperation(confirmationMessage);
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract: timelockContract,
      methodName: 'cancel',
      payload: [operationId],
    });
  });

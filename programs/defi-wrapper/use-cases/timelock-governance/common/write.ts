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
  stringToBigInt,
  processSalt,
} from 'utils';
import { common } from './main.js';
import { Address, stringToHex, isHex, Hash, Hex } from 'viem';
import {
  DEFAULT_PREDECESSOR,
  executeOperation,
  getPromptTimelock,
  OPERATION_ID_ARGUMENT,
  promptOperationId,
  SALT_OPTION,
  TIMELOCK_ARGUMENT,
} from 'features/defi-wrapper/index.js';

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
  .argument(...TIMELOCK_ARGUMENT)
  .argument('[target]', 'target contract address', stringToAddress)
  .argument('[value]', 'ETH value to send (in wei, default: 0)', stringToBigInt)
  .argument('[payload]', 'call data payload (hex)')
  .option(
    '-p, --predecessor <predecessor>',
    'predecessor operation ID (bytes32 hex, default: 0x0)',
  )
  .option(...SALT_OPTION)
  .action(
    async (
      timelock?: Address,
      target?: Address,
      value?: bigint,
      payloadInput?: string,
      options?: { predecessor?: string; salt?: Hex },
    ) => {
      // Interactive prompts for missing parameters
      const timelockContract = await getPromptTimelock(timelock);

      if (!target) {
        const targetPrompt = await addressPrompt(
          'Enter target contract address',
          'target',
        );
        target = targetPrompt.target as Address;
      }

      const finalValue = value ?? 0n;

      if (!payloadInput) {
        const payloadPrompt = await textPrompt(
          'Enter call data payload (hex)',
          'payload',
        );
        payloadInput = payloadPrompt.payload as string;
      }

      // Validate and convert to hex - if already hex, use as is
      const payload = isHex(payloadInput)
        ? payloadInput
        : stringToHex(payloadInput);

      const predecessor = options?.predecessor
        ? isHex(options.predecessor)
          ? options.predecessor
          : stringToHex(options.predecessor)
        : DEFAULT_PREDECESSOR;

      const salt = processSalt(options?.salt);

      await executeOperation(
        timelockContract.address,
        target,
        payload,
        salt,
        'Unknown execute operation',
        `Are you sure you want to execute this operation on target ${target}?`,
        finalValue,
        predecessor,
      );
    },
  );

commonWrite
  .command('cancel')
  .description('cancel a scheduled timelock operation')
  .argument(...TIMELOCK_ARGUMENT)
  .argument(...OPERATION_ID_ARGUMENT)
  .action(async (timelock?: Address, operationIdInput?: Hash) => {
    // Interactive prompts for missing parameters
    const timelockContract = await getPromptTimelock(timelock);
    const operationId = await promptOperationId(operationIdInput);

    // Check operation state
    const state = await callReadMethodSilent({
      contract: timelockContract,
      methodName: 'getOperationState',
      payload: [[operationId]],
    });
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

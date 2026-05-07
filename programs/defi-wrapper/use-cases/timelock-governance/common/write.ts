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
  stringToHex as stringToHexArgument,
  logTable,
} from 'utils';
import { common } from './main.js';
import {
  Address,
  Hash,
  Hex,
  AbiFunction,
  stringToHex,
  formatEther,
  encodeFunctionData,
  decodeFunctionData,
} from 'viem';
import {
  DEFAULT_PREDECESSOR,
  executeOperation,
  getPromptTimelock,
  OPERATION_ID_ARGUMENT,
  PREDECESSOR_OPTION,
  promptOperationId,
  proposeOperation,
  SALT_OPTION,
  SKIP_SIMULATION_OPTION,
  TARGET_CONTRACT_TYPE_ARGUMENT,
  targetContractTypeToAbi,
  TIMELOCK_ARGUMENT,
} from 'features/defi-wrapper/index.js';
import { parseAbiArguments } from 'utils/parse-abi-arguments.js';

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
  .command('propose')
  .description('propose a new timelock operation')
  .argument(...TIMELOCK_ARGUMENT)
  .argument('[target]', 'target contract address', stringToAddress)
  .argument('[value]', 'ETH value to send (in wei, default: 0)', stringToBigInt)
  .argument('[payload]', 'call data payload (hex)', stringToHexArgument, '0x')
  .option(...PREDECESSOR_OPTION)
  .option(...SALT_OPTION)
  .action(
    async (
      timelock?: Address,
      target?: Address,
      value?: bigint,
      payloadInput?: Hex,
      options?: { predecessor?: Hex; salt?: Hex },
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
        payloadInput = stringToHex(payloadPrompt.payload);
      }

      const salt = processSalt(options?.salt);

      await proposeOperation(
        timelockContract.address,
        target,
        payloadInput,
        salt,
        'Unknown propose operation',
        `Are you sure you want to propose this operation on target ${target}?`,
        { predecessor: options?.predecessor, value: finalValue },
      );
    },
  );

commonWrite
  .command('propose-operation')
  .description('propose a new timelock operation')
  .argument(...TIMELOCK_ARGUMENT)
  .argument(...TARGET_CONTRACT_TYPE_ARGUMENT)
  .argument('<targetAddress>', 'targeted contract address', stringToAddress)
  .argument('<method>', 'method to call on target contract')
  .argument(
    '[args...]',
    'arguments(if needed) to call with the method(in their string form,comma separated, will be parsed to correct types based on ABI)',
  )
  .argument('[value]', 'ETH value to send (in wei, default: 0)', stringToBigInt)
  .option(...PREDECESSOR_OPTION)
  .option(...SALT_OPTION)
  .option(...SKIP_SIMULATION_OPTION)
  .action(
    async (
      timelock: Address,
      targetContractType: keyof typeof targetContractTypeToAbi,
      targetAddress: Address,
      methodName: string,
      argsInput: string[] = [],
      value: bigint = 0n,
      options?: { predecessor?: Hex; salt?: Hex; skipSimulation?: boolean },
    ) => {
      const timelockContract = await getPromptTimelock(timelock);
      const abi = targetContractTypeToAbi[targetContractType];

      const methodAbi = abi?.find(
        (item) =>
          'name' in item &&
          item.name === methodName &&
          item.type === 'function',
      ) as AbiFunction;
      if (!methodAbi) {
        throw new Error(
          `❌ Method ${methodName} not found in ABI for contract type ${targetContractType}. Available methods: ${abi
            .filter((item) => item.type === 'function')
            .map((item) => 'name' in item && item.name)
            .join(', ')}`,
        );
      }

      if (methodAbi.stateMutability === 'nonpayable' && value > 0n) {
        logInfo(
          `⚠️ Method ${methodName} is nonpayable but a value of ${formatEther(value)} ETH was provided`,
        );
      }

      if (
        methodAbi.stateMutability === 'pure' ||
        methodAbi.stateMutability === 'view'
      ) {
        logInfo(
          `⚠️ Method ${methodName} is a ${methodAbi.stateMutability} function, which typically should not be used in a transaction. Make sure this is intentional.`,
        );
      }

      const inputs = methodAbi.inputs ?? [];
      if (inputs.length != (argsInput?.length ?? 0)) {
        throw new Error(
          `❌ Method ${methodName} expects ${inputs.length} arguments, but got ${argsInput?.length ?? 0}`,
        );
      }

      const parsedArgs = parseAbiArguments(methodAbi, argsInput);

      const data = encodeFunctionData({
        abi: abi,
        functionName: methodName,
        args: parsedArgs,
      });

      await proposeOperation(
        timelockContract.address,
        targetAddress,
        data,
        processSalt(options?.salt),
        methodName,
        `Are you sure you want to propose executing ${methodName} on contract ${targetContractType} at ${targetAddress}?`,
        {
          predecessor: options?.predecessor,
          value,
          skipSimulation: options?.skipSimulation,
        },
      );
    },
  );

commonWrite
  .command('execute-operation')
  .description('execute a scheduled timelock operation')
  .argument(...TIMELOCK_ARGUMENT)
  .argument(...OPERATION_ID_ARGUMENT)
  .option(...SALT_OPTION)
  .action(
    async (timelock: Address, operationId: Hash, options?: { salt?: Hex }) => {
      const timelockContract = await getPromptTimelock(timelock);
      const state = await timelockContract.read.getOperationState([
        operationId,
      ]);
      if (state !== 2) {
        throw new Error(
          `❌ Operation is not ready for execution. Current state: ${state === 0 ? 'Unset' : state === 1 ? 'Waiting' : state === 3 ? 'Done' : 'Unknown'}`,
        );
      }

      const operationDetails = await timelockContract.getEvents.CallScheduled(
        {
          id: operationId,
        },
        {
          strict: true,
        },
      );

      const allAbi = Object.values(targetContractTypeToAbi).flat();

      if (operationDetails.length === 1) {
        const event = operationDetails.at(0); // Get the most recent event in case of multiple
        if (!event) {
          throw new Error(
            `❌ No CallScheduled event found for operation ID: ${operationId}`,
          );
        }

        const { target, data, predecessor, value } = event.args as Required<
          typeof event.args
        >;

        let functionName = `Unknown(${data})`;

        try {
          const { args, functionName: decodedFunctionName } =
            decodeFunctionData({
              abi: allAbi,
              data,
            });
          functionName = `${decodedFunctionName}(${args
            .map((arg) =>
              JSON.stringify(arg, (_, value) =>
                typeof value === 'bigint' ? value.toString() : value,
              ),
            )
            .join(',')})`;
        } catch (error) {
          logInfo(
            `⚠️ Failed to decode function data for simulation. Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }

        await executeOperation(
          timelockContract.address,
          target,
          data,
          processSalt(options?.salt),
          functionName,
          `Are you sure you want to execute this operation on target ${target}?`,
          { predecessor, value },
        );
      } else if (operationDetails.length > 1) {
        logInfo(
          `⚠️ Multiple CallScheduled events found for operation ID: ${operationId}. Processing Batch.`,
        );

        const details: string[][] = [];
        let predecessor: Hex = DEFAULT_PREDECESSOR;

        for (const event of operationDetails) {
          const {
            target,
            index,
            data,
            value,
            predecessor: eventPredecessor,
          } = event.args as Required<typeof event.args>;
          let functionName = `Unknown(${data})`;
          let decodedArgs = 'N/A';
          predecessor = eventPredecessor;

          try {
            const { args, functionName: decodedFunctionName } =
              decodeFunctionData({
                abi: allAbi,
                data,
              });

            functionName = decodedFunctionName;

            decodedArgs = args
              .map((arg) =>
                JSON.stringify(arg, (_, value) =>
                  typeof value === 'bigint' ? value.toString() : value,
                ),
              )
              .join(',');
          } catch (error) {
            logInfo(
              `⚠️ Failed to decode function data for simulation. Error: ${
                error instanceof Error ? error.message : String(error)
              }`,
            );
          }

          details.push([
            index.toString(),
            target,
            functionName,
            decodedArgs,
            formatEther(value),
          ]);
        }

        logTable({
          params: {
            head: [
              'Index',
              'Target Address',
              'Function',
              'Decoded Args',
              'Value (ETH)',
            ],
          },
          data: details,
        });

        const confirm = await confirmOperation(
          `Are you sure you want to execute this batch operation?`,
        );
        if (!confirm) return;

        await callWriteMethodWithReceipt({
          contract: timelockContract,
          methodName: 'executeBatch',
          payload: [
            operationDetails.map((event) => event.args.target as Address),
            operationDetails.map((event) => event.args.value as bigint),
            operationDetails.map((event) => event.args.data as Hex),
            predecessor,
            processSalt(options?.salt),
          ],
          value: operationDetails.reduce(
            (acc, event) => acc + (event.args.value as bigint),
            0n,
          ),
        });
      } else {
        throw new Error(
          `❌ No CallScheduled event found for operation ID: ${operationId}`,
        );
      }
    },
  );

commonWrite
  .command('execute')
  .description('execute a scheduled timelock operation')
  .argument(...TIMELOCK_ARGUMENT)
  .argument('[target]', 'target contract address', stringToAddress)
  .argument('[value]', 'ETH value to send (in wei, default: 0)', stringToBigInt)
  .argument('[payload]', 'call data payload (hex)', stringToHexArgument, '0x')
  .option(...PREDECESSOR_OPTION)
  .option(...SALT_OPTION)
  .action(
    async (
      timelock?: Address,
      target?: Address,
      value?: bigint,
      payloadInput?: Hex,
      options?: { predecessor?: Hex; salt?: Hex },
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
        payloadInput = stringToHex(payloadPrompt.payload);
      }

      const salt = processSalt(options?.salt);

      await executeOperation(
        timelockContract.address,
        target,
        payloadInput,
        salt,
        'Unknown execute operation',
        `Are you sure you want to execute this operation on target ${target}?`,
        { predecessor: options?.predecessor, value: finalValue },
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

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
import { proxy } from './main.js';
import { Address, Hex, encodeFunctionData, stringToHex } from 'viem';
import { getTimeLockContract } from 'contracts/defi-wrapper/index.js';
import { OssifiableProxyAbi } from 'abi/defi-wrapper/index.js';
import { getPublicClient } from 'providers';

const proxyWrite = proxy
  .command('write')
  .alias('w')
  .description('proxy timelock write commands');

proxyWrite.addOption(new Option('-cmd2json'));
proxyWrite.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(proxyWrite));
  process.exit();
});

// Helper function for propose operations
const proposeOperation = async (
  timelock: Address,
  target: Address,
  data: Hex,
  salt: Hex,
  functionName: string,
  confirmationMessage: string,
): Promise<Hex> => {
  const timelockContract = await getTimeLockContract(timelock);
  const minDelay = await callReadMethodSilent(timelockContract, 'getMinDelay');

  const predecessor =
    '0x0000000000000000000000000000000000000000000000000000000000000000' as Hex;

  const operationId = await callReadMethodSilent(
    timelockContract,
    'hashOperation',
    [target, 0n, data, predecessor, salt],
  );

  logInfo('Proposing operation:');
  logInfo(`  Operation ID: ${operationId}`);
  logInfo(`  Target: ${target}`);
  logInfo(`  Value: 0`);
  logInfo(`  Payload: ${data}`);
  logInfo(`  Predecessor: ${predecessor}`);
  logInfo(`  Salt: ${salt}`);
  logInfo(`  Function: ${functionName}`);
  logInfo(`  Min delay: ${minDelay} seconds`);

  const confirm = await confirmOperation(confirmationMessage);
  if (!confirm) {
    throw new Error('Operation cancelled by user');
  }

  await callWriteMethodWithReceipt({
    contract: timelockContract,
    methodName: 'schedule',
    payload: [target, 0n, data, predecessor, salt, minDelay],
  });

  logInfo(`✅ Operation proposed successfully!`);
  logInfo(`   Operation ID: ${operationId}`);
  logInfo(`   Execute after: ${minDelay} seconds`);

  return operationId;
};

// Helper function for execute operations
const executeOperation = async (
  timelock: Address,
  target: Address,
  data: Hex,
  salt: Hex,
  functionName: string,
  confirmationMessage: string,
): Promise<void> => {
  const timelockContract = await getTimeLockContract(timelock);
  const predecessor =
    '0x0000000000000000000000000000000000000000000000000000000000000000' as Hex;

  const operationId = await callReadMethodSilent(
    timelockContract,
    'hashOperation',
    [target, 0n, data, predecessor, salt],
  );

  logInfo('Calculated operation details:');
  logInfo(`  Operation ID: ${operationId}`);
  logInfo(`  Target: ${target}`);
  logInfo(`  Value: 0`);
  logInfo(`  Payload: ${data}`);
  logInfo(`  Predecessor: ${predecessor}`);
  logInfo(`  Salt: ${salt}`);

  const state = await callReadMethodSilent(
    timelockContract,
    'getOperationState',
    [operationId],
  );

  if (state === 0) {
    logInfo('❌ Operation not found (Unset)');
    logInfo(`   Operation ID: ${operationId}`);
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
    const currentBlock = await publicClient.getBlock({ blockTag: 'latest' });
    const now = currentBlock.timestamp;
    const waitTime = timestamp > now ? timestamp - now : 0n;
    logInfo(
      `⏳ Operation is waiting. Will be ready at timestamp ${timestamp} (in ${waitTime} seconds)`,
    );
    return;
  }

  logInfo('Executing operation:');
  logInfo(`  Operation ID: ${operationId}`);
  logInfo(`  Target: ${target}`);
  logInfo(`  Function: ${functionName}`);

  const confirm = await confirmOperation(confirmationMessage);
  if (!confirm) return;

  await callWriteMethodWithReceipt({
    contract: timelockContract,
    methodName: 'execute',
    payload: [target, 0n, data, predecessor, salt],
  });

  logInfo(`✅ Operation executed successfully!`);
  logInfo(`   Operation ID: ${operationId}`);
};

// propose-upgrade-to
proxyWrite
  .command('propose-upgrade-to')
  .description('propose upgrading proxy implementation via Timelock')
  .argument('[timelock]', 'timelock contract address', stringToAddress)
  .argument('[proxy]', 'proxy contract address', stringToAddress)
  .argument('[newImplementation]', 'new implementation address')
  .option('-s, --salt <salt>', 'salt for operation (bytes32 hex, default: 0x0)')
  .action(
    async (
      timelock?: Address,
      proxyAddress?: Address,
      newImplementationInput?: string,
      options?: { salt?: string },
    ) => {
      if (!timelock) {
        const timelockPrompt = await addressPrompt(
          'Enter timelock contract address',
          'timelock',
        );
        timelock = timelockPrompt.timelock as Address;
      }

      if (!proxyAddress) {
        const proxyPrompt = await addressPrompt(
          'Enter proxy contract address',
          'proxy',
        );
        proxyAddress = proxyPrompt.proxy as Address;
      }

      if (!newImplementationInput) {
        const newImplementationPrompt = await addressPrompt(
          'Enter new implementation address',
          'newImplementation',
        );
        newImplementationInput =
          newImplementationPrompt.newImplementation as string;
      }

      const newImplementation = stringToAddress(newImplementationInput);

      const finalSalt = options?.salt
        ? stringToHex(options.salt)
        : ('0x0000000000000000000000000000000000000000000000000000000000000000' as Hex);

      const data = encodeFunctionData({
        abi: OssifiableProxyAbi,
        functionName: 'proxy__upgradeTo',
        args: [newImplementation],
      });

      await proposeOperation(
        timelock,
        proxyAddress,
        data,
        finalSalt,
        `proxy__upgradeTo(${newImplementation})`,
        `Are you sure you want to propose upgrading proxy ${proxyAddress} to implementation ${newImplementation}?`,
      );
    },
  );

// execute-upgrade-to
proxyWrite
  .command('execute-upgrade-to')
  .description('execute upgrading proxy implementation via Timelock')
  .argument('[timelock]', 'timelock contract address', stringToAddress)
  .argument('[proxy]', 'proxy contract address', stringToAddress)
  .argument('[newImplementation]', 'new implementation address')
  .option('-s, --salt <salt>', 'salt for operation (bytes32 hex, default: 0x0)')
  .action(
    async (
      timelock?: Address,
      proxyAddress?: Address,
      newImplementationInput?: string,
      options?: { salt?: string },
    ) => {
      if (!timelock) {
        const timelockPrompt = await addressPrompt(
          'Enter timelock contract address',
          'timelock',
        );
        timelock = timelockPrompt.timelock as Address;
      }

      if (!proxyAddress) {
        const proxyPrompt = await addressPrompt(
          'Enter proxy contract address',
          'proxy',
        );
        proxyAddress = proxyPrompt.proxy as Address;
      }

      if (!newImplementationInput) {
        const newImplementationPrompt = await addressPrompt(
          'Enter new implementation address',
          'newImplementation',
        );
        newImplementationInput =
          newImplementationPrompt.newImplementation as string;
      }

      const newImplementation = stringToAddress(newImplementationInput);

      const finalSalt = options?.salt
        ? stringToHex(options.salt)
        : ('0x0000000000000000000000000000000000000000000000000000000000000000' as Hex);

      const data = encodeFunctionData({
        abi: OssifiableProxyAbi,
        functionName: 'proxy__upgradeTo',
        args: [newImplementation],
      });

      await executeOperation(
        timelock,
        proxyAddress,
        data,
        finalSalt,
        `proxy__upgradeTo(${newImplementation})`,
        `Are you sure you want to execute upgrading proxy ${proxyAddress} to implementation ${newImplementation}?`,
      );
    },
  );

// propose-upgrade-to-and-call
proxyWrite
  .command('propose-upgrade-to-and-call')
  .description(
    'propose upgrading proxy implementation with setup call via Timelock',
  )
  .argument('[timelock]', 'timelock contract address', stringToAddress)
  .argument('[proxy]', 'proxy contract address', stringToAddress)
  .argument('[newImplementation]', 'new implementation address')
  .argument('[setupCalldata]', 'setup calldata (hex)')
  .option('-s, --salt <salt>', 'salt for operation (bytes32 hex, default: 0x0)')
  .action(
    async (
      timelock?: Address,
      proxyAddress?: Address,
      newImplementationInput?: string,
      setupCalldataInput?: string,
      options?: { salt?: string },
    ) => {
      if (!timelock) {
        const timelockPrompt = await addressPrompt(
          'Enter timelock contract address',
          'timelock',
        );
        timelock = timelockPrompt.timelock as Address;
      }

      if (!proxyAddress) {
        const proxyPrompt = await addressPrompt(
          'Enter proxy contract address',
          'proxy',
        );
        proxyAddress = proxyPrompt.proxy as Address;
      }

      if (!newImplementationInput) {
        const newImplementationPrompt = await addressPrompt(
          'Enter new implementation address',
          'newImplementation',
        );
        newImplementationInput =
          newImplementationPrompt.newImplementation as string;
      }

      const newImplementation = stringToAddress(newImplementationInput);

      if (!setupCalldataInput) {
        const setupCalldataPrompt = await textPrompt(
          'Enter setup calldata (hex)',
          'setupCalldata',
        );
        setupCalldataInput = setupCalldataPrompt.setupCalldata as string;
      }

      const setupCalldata = setupCalldataInput as Hex;

      const finalSalt = options?.salt
        ? stringToHex(options.salt)
        : ('0x0000000000000000000000000000000000000000000000000000000000000000' as Hex);

      const data = encodeFunctionData({
        abi: OssifiableProxyAbi,
        functionName: 'proxy__upgradeToAndCall',
        args: [newImplementation, setupCalldata],
      });

      await proposeOperation(
        timelock,
        proxyAddress,
        data,
        finalSalt,
        `proxy__upgradeToAndCall(${newImplementation}, ${setupCalldata})`,
        `Are you sure you want to propose upgrading proxy ${proxyAddress} to implementation ${newImplementation} with setup call?`,
      );
    },
  );

// execute-upgrade-to-and-call
proxyWrite
  .command('execute-upgrade-to-and-call')
  .description(
    'execute upgrading proxy implementation with setup call via Timelock',
  )
  .argument('[timelock]', 'timelock contract address', stringToAddress)
  .argument('[proxy]', 'proxy contract address', stringToAddress)
  .argument('[newImplementation]', 'new implementation address')
  .argument('[setupCalldata]', 'setup calldata (hex)')
  .option('-s, --salt <salt>', 'salt for operation (bytes32 hex, default: 0x0)')
  .action(
    async (
      timelock?: Address,
      proxyAddress?: Address,
      newImplementationInput?: string,
      setupCalldataInput?: string,
      options?: { salt?: string },
    ) => {
      if (!timelock) {
        const timelockPrompt = await addressPrompt(
          'Enter timelock contract address',
          'timelock',
        );
        timelock = timelockPrompt.timelock as Address;
      }

      if (!proxyAddress) {
        const proxyPrompt = await addressPrompt(
          'Enter proxy contract address',
          'proxy',
        );
        proxyAddress = proxyPrompt.proxy as Address;
      }

      if (!newImplementationInput) {
        const newImplementationPrompt = await addressPrompt(
          'Enter new implementation address',
          'newImplementation',
        );
        newImplementationInput =
          newImplementationPrompt.newImplementation as string;
      }

      const newImplementation = stringToAddress(newImplementationInput);

      if (!setupCalldataInput) {
        const setupCalldataPrompt = await textPrompt(
          'Enter setup calldata (hex)',
          'setupCalldata',
        );
        setupCalldataInput = setupCalldataPrompt.setupCalldata as string;
      }

      const setupCalldata = setupCalldataInput as Hex;

      const finalSalt = options?.salt
        ? stringToHex(options.salt)
        : ('0x0000000000000000000000000000000000000000000000000000000000000000' as Hex);

      const data = encodeFunctionData({
        abi: OssifiableProxyAbi,
        functionName: 'proxy__upgradeToAndCall',
        args: [newImplementation, setupCalldata],
      });

      await executeOperation(
        timelock,
        proxyAddress,
        data,
        finalSalt,
        `proxy__upgradeToAndCall(${newImplementation}, ${setupCalldata})`,
        `Are you sure you want to execute upgrading proxy ${proxyAddress} to implementation ${newImplementation} with setup call?`,
      );
    },
  );

import { Option } from 'commander';
import {
  proposeOperation,
  executeOperation,
  processSalt,
} from 'features/defi-wrapper/index.js';
import {
  logInfo,
  getCommandsJson,
  stringToAddress,
  addressPrompt,
  textPrompt,
} from 'utils';
import { proxy } from './main.js';
import { Address, Hex, encodeFunctionData } from 'viem';
import { OssifiableProxyAbi } from 'abi/defi-wrapper/index.js';

const proxyWrite = proxy
  .command('write')
  .alias('w')
  .description('proxy timelock write commands');

proxyWrite.addOption(new Option('-cmd2json'));
proxyWrite.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(proxyWrite));
  process.exit();
});

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

      const finalSalt = processSalt(options?.salt);

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

      const finalSalt = processSalt(options?.salt);

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

      const finalSalt = processSalt(options?.salt);

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

      const finalSalt = processSalt(options?.salt);

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

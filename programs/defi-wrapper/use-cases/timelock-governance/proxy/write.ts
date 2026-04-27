import { Option } from 'commander';
import { Address, Hex, encodeFunctionData } from 'viem';

import {
  proposeOperation,
  executeOperation,
  TIMELOCK_ARGUMENT,
  getPromptTimelock,
  SALT_OPTION,
} from 'features/defi-wrapper/index.js';
import {
  logInfo,
  getCommandsJson,
  stringToAddress,
  addressPrompt,
  textPrompt,
  stringToHex,
  processSalt,
} from 'utils';
import { OssifiableProxyAbi } from 'abi/defi-wrapper/index.js';
import { getOssifiableProxyContract } from 'contracts/defi-wrapper/index.js';

import { proxy } from './main.js';

// Common helpers

const PROXY_ARGUMENT = [
  '[proxy]',
  'proxy contract address',
  stringToAddress,
] as const;

const NEW_IMPLEMENTATION_ARGUMENT = [
  '[newImplementation]',
  'new implementation address',
  stringToAddress,
] as const;

const SETUP_CALLDATA_ARGUMENT = [
  '[setupCalldata]',
  'setup calldata (hex)',
  stringToHex,
] as const;

const promptProxy = async (proxyAddress?: Address) => {
  if (!proxyAddress) {
    const proxyPrompt = await addressPrompt(
      'Enter proxy contract address',
      'proxy',
    );
    proxyAddress = proxyPrompt.proxy as Address;
  }
  return getOssifiableProxyContract(proxyAddress);
};

const promptNewImplementation = async (
  newImplementationInput?: string,
): Promise<Address> => {
  if (!newImplementationInput) {
    const newImplementationPrompt = await addressPrompt(
      'Enter new implementation address',
      'newImplementation',
    );
    newImplementationInput =
      newImplementationPrompt.newImplementation as string;
  }

  return stringToAddress(newImplementationInput);
};

const promptSetupCalldata = async (
  setupCalldataInput?: string,
): Promise<Hex> => {
  if (!setupCalldataInput) {
    const setupCalldataPrompt = await textPrompt(
      'Enter setup calldata (hex)',
      'setupCalldata',
    );
    setupCalldataInput = setupCalldataPrompt.setupCalldata as string;
  }

  return setupCalldataInput as Hex;
};

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
  .argument(...TIMELOCK_ARGUMENT)
  .argument(...PROXY_ARGUMENT)
  .argument(...NEW_IMPLEMENTATION_ARGUMENT)
  .option(...SALT_OPTION)
  .action(
    async (
      timelock?: Address,
      proxyAddress?: Address,
      newImplementationInput?: string,
      options?: { salt?: Hex },
    ) => {
      const timelockContract = await getPromptTimelock(timelock);
      const proxyContract = await promptProxy(proxyAddress);
      const newImplementation = await promptNewImplementation(
        newImplementationInput,
      );

      const finalSalt = processSalt(options?.salt);

      const data = encodeFunctionData({
        abi: OssifiableProxyAbi,
        functionName: 'proxy__upgradeTo',
        args: [newImplementation],
      });

      await proposeOperation(
        timelockContract.address,
        proxyContract.address,
        data,
        finalSalt,
        `proxy__upgradeTo(${newImplementation})`,
        `Are you sure you want to propose upgrading proxy ${proxyContract.address} to implementation ${newImplementation}?`,
      );
    },
  );

// execute-upgrade-to
proxyWrite
  .command('execute-upgrade-to')
  .description('execute upgrading proxy implementation via Timelock')
  .argument(...TIMELOCK_ARGUMENT)
  .argument(...PROXY_ARGUMENT)
  .argument(...NEW_IMPLEMENTATION_ARGUMENT)
  .option(...SALT_OPTION)
  .action(
    async (
      timelock?: Address,
      proxyAddress?: Address,
      newImplementationInput?: string,
      options?: { salt?: Hex },
    ) => {
      const timelockContract = await getPromptTimelock(timelock);
      const proxyContract = await promptProxy(proxyAddress);
      const newImplementation = await promptNewImplementation(
        newImplementationInput,
      );

      const finalSalt = processSalt(options?.salt);

      const data = encodeFunctionData({
        abi: OssifiableProxyAbi,
        functionName: 'proxy__upgradeTo',
        args: [newImplementation],
      });

      await executeOperation(
        timelockContract.address,
        proxyContract.address,
        data,
        finalSalt,
        `proxy__upgradeTo(${newImplementation})`,
        `Are you sure you want to execute upgrading proxy ${proxyContract.address} to implementation ${newImplementation}?`,
      );
    },
  );

// propose-upgrade-to-and-call
proxyWrite
  .command('propose-upgrade-to-and-call')
  .description(
    'propose upgrading proxy implementation with setup call via Timelock',
  )
  .argument(...TIMELOCK_ARGUMENT)
  .argument(...PROXY_ARGUMENT)
  .argument(...NEW_IMPLEMENTATION_ARGUMENT)
  .argument(...SETUP_CALLDATA_ARGUMENT)
  .option(...SALT_OPTION)
  .action(
    async (
      timelock?: Address,
      proxyAddress?: Address,
      newImplementationInput?: string,
      setupCalldataInput?: string,
      options?: { salt?: Hex },
    ) => {
      const timelockContract = await getPromptTimelock(timelock);
      const proxyContract = await promptProxy(proxyAddress);
      const newImplementation = await promptNewImplementation(
        newImplementationInput,
      );
      const setupCalldata = await promptSetupCalldata(setupCalldataInput);

      const finalSalt = processSalt(options?.salt);

      const data = encodeFunctionData({
        abi: OssifiableProxyAbi,
        functionName: 'proxy__upgradeToAndCall',
        args: [newImplementation, setupCalldata],
      });

      await proposeOperation(
        timelockContract.address,
        proxyContract.address,
        data,
        finalSalt,
        `proxy__upgradeToAndCall(${newImplementation}, ${setupCalldata})`,
        `Are you sure you want to propose upgrading proxy ${proxyContract.address} to implementation ${newImplementation} with setup call?`,
      );
    },
  );

// execute-upgrade-to-and-call
proxyWrite
  .command('execute-upgrade-to-and-call')
  .description(
    'execute upgrading proxy implementation with setup call via Timelock',
  )
  .argument(...TIMELOCK_ARGUMENT)
  .argument(...PROXY_ARGUMENT)
  .argument(...NEW_IMPLEMENTATION_ARGUMENT)
  .argument(...SETUP_CALLDATA_ARGUMENT)
  .option(...SALT_OPTION)
  .action(
    async (
      timelock?: Address,
      proxyAddress?: Address,
      newImplementationInput?: string,
      setupCalldataInput?: string,
      options?: { salt?: Hex },
    ) => {
      const timelockContract = await getPromptTimelock(timelock);
      const proxyContract = await promptProxy(proxyAddress);
      const newImplementation = await promptNewImplementation(
        newImplementationInput,
      );
      const setupCalldata = await promptSetupCalldata(setupCalldataInput);

      const finalSalt = processSalt(options?.salt);

      const data = encodeFunctionData({
        abi: OssifiableProxyAbi,
        functionName: 'proxy__upgradeToAndCall',
        args: [newImplementation, setupCalldata],
      });

      await executeOperation(
        timelockContract.address,
        proxyContract.address,
        data,
        finalSalt,
        `proxy__upgradeToAndCall(${newImplementation}, ${setupCalldata})`,
        `Are you sure you want to execute upgrading proxy ${proxyContract.address} to implementation ${newImplementation} with setup call?`,
      );
    },
  );

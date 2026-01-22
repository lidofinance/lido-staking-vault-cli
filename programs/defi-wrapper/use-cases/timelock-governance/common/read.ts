import { Option } from 'commander';
import {
  logInfo,
  getCommandsJson,
  stringToAddress,
  callReadMethodSilent,
  logResult,
  addressPrompt,
  textPrompt,
} from 'utils';
import { common } from './main.js';
import { Address, Hex, stringToHex, isHex } from 'viem';
import { getTimeLockContract } from 'contracts/defi-wrapper/index.js';
import { getPublicClient } from 'providers';

const commonRead = common
  .command('read')
  .alias('r')
  .description('common timelock read commands');

commonRead.addOption(new Option('-cmd2json'));
commonRead.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(commonRead));
  process.exit();
});

commonRead
  .command('get-operation-state')
  .description('get the state of a timelock operation')
  .argument('[timelock]', 'timelock contract address', stringToAddress)
  .argument('[operationId]', 'operation ID (bytes32 hash)')
  .action(async (timelock?: Address, operationIdInput?: string) => {
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

    // Validate and convert to hex
    if (!isHex(operationIdInput)) {
      operationId = stringToHex(operationIdInput);
    } else {
      operationId = operationIdInput;
    }

    const timelockContract = await getTimeLockContract(timelock);
    const state = await callReadMethodSilent(
      timelockContract,
      'getOperationState',
      [operationId],
    );

    // OperationState: Unset=0, Waiting=1, Ready=2, Done=3
    const stateNames = ['Unset', 'Waiting', 'Ready', 'Done'];
    const stateName = stateNames[state] || 'Unknown';

    logResult({
      data: [
        ['Operation ID', operationId],
        ['State', `${state} (${stateName})`],
      ],
    });

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
        `Will be ready at timestamp ${timestamp} (in ${waitTime} seconds)`,
      );
    }
  });

commonRead
  .command('get-timestamp')
  .description('get the timestamp when an operation will be ready')
  .argument('[timelock]', 'timelock contract address', stringToAddress)
  .argument('[operationId]', 'operation ID (bytes32 hash)')
  .action(async (timelock?: Address, operationIdInput?: string) => {
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
    const timestamp = await callReadMethodSilent(
      timelockContract,
      'getTimestamp',
      [operationId],
    );

    const publicClient = await getPublicClient();
    const currentBlock = await publicClient.getBlock({ blockTag: 'latest' });
    const now = currentBlock.timestamp;
    const waitTime = timestamp > now ? timestamp - now : 0n;
    const readyDate = new Date(Number(timestamp) * 1000).toLocaleString();

    logResult({
      data: [
        ['Operation ID', operationId],
        ['Timestamp', timestamp.toString()],
        ['Ready Date', readyDate],
        ['Wait Time (seconds)', waitTime.toString()],
      ],
    });
  });

commonRead
  .command('get-min-delay')
  .description('get the minimum delay for timelock operations')
  .argument('[timelock]', 'timelock contract address', stringToAddress)
  .action(async (timelock?: Address) => {
    if (!timelock) {
      const timelockPrompt = await addressPrompt(
        'Enter timelock contract address',
        'timelock',
      );
      timelock = timelockPrompt.timelock as Address;
    }

    const timelockContract = await getTimeLockContract(timelock);
    const minDelay = await callReadMethodSilent(
      timelockContract,
      'getMinDelay',
    );

    logResult({
      data: [
        ['Timelock', timelock],
        ['Min Delay (seconds)', minDelay.toString()],
        ['Min Delay (hours)', (Number(minDelay) / 3600).toFixed(2)],
      ],
    });
  });

commonRead
  .command('is-operation')
  .description('check if an operation is registered')
  .argument('[timelock]', 'timelock contract address', stringToAddress)
  .argument('[operationId]', 'operation ID (bytes32 hash)')
  .action(async (timelock?: Address, operationIdInput?: string) => {
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

    if (isHex(operationIdInput)) {
      operationId = operationIdInput;
    } else {
      operationId = stringToHex(operationIdInput);
    }

    const timelockContract = await getTimeLockContract(timelock);
    const isOp = await callReadMethodSilent(timelockContract, 'isOperation', [
      operationId,
    ]);

    logResult({
      data: [
        ['Operation ID', operationId],
        ['Is Operation', isOp ? '✅ Yes' : '❌ No'],
      ],
    });
  });

commonRead
  .command('is-operation-pending')
  .description('check if an operation is pending (waiting or ready)')
  .argument('[timelock]', 'timelock contract address', stringToAddress)
  .argument('[operationId]', 'operation ID (bytes32 hash)')
  .action(async (timelock?: Address, operationIdInput?: string) => {
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

    if (isHex(operationIdInput)) {
      operationId = operationIdInput;
    } else {
      operationId = stringToHex(operationIdInput);
    }

    const timelockContract = await getTimeLockContract(timelock);
    const isPending = await callReadMethodSilent(
      timelockContract,
      'isOperationPending',
      [operationId],
    );

    logResult({
      data: [
        ['Operation ID', operationId],
        ['Is Pending', isPending ? '✅ Yes' : '❌ No'],
      ],
    });
  });

commonRead
  .command('is-operation-ready')
  .description('check if an operation is ready for execution')
  .argument('[timelock]', 'timelock contract address', stringToAddress)
  .argument('[operationId]', 'operation ID (bytes32 hash)')
  .action(async (timelock?: Address, operationIdInput?: string) => {
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

    if (isHex(operationIdInput)) {
      operationId = operationIdInput;
    } else {
      operationId = stringToHex(operationIdInput);
    }

    const timelockContract = await getTimeLockContract(timelock);
    const isReady = await callReadMethodSilent(
      timelockContract,
      'isOperationReady',
      [operationId],
    );

    logResult({
      data: [
        ['Operation ID', operationId],
        ['Is Ready', isReady ? '✅ Yes' : '❌ No'],
      ],
    });
  });

commonRead
  .command('is-operation-done')
  .description('check if an operation is done (executed)')
  .argument('[timelock]', 'timelock contract address', stringToAddress)
  .argument('[operationId]', 'operation ID (bytes32 hash)')
  .action(async (timelock?: Address, operationIdInput?: string) => {
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

    if (isHex(operationIdInput)) {
      operationId = operationIdInput;
    } else {
      operationId = stringToHex(operationIdInput);
    }

    const timelockContract = await getTimeLockContract(timelock);
    const isDone = await callReadMethodSilent(
      timelockContract,
      'isOperationDone',
      [operationId],
    );

    logResult({
      data: [
        ['Operation ID', operationId],
        ['Is Done', isDone ? '✅ Yes' : '❌ No'],
      ],
    });
  });

commonRead
  .command('get-operation-info')
  .description('get comprehensive information about an operation')
  .argument('[timelock]', 'timelock contract address', stringToAddress)
  .argument('[operationId]', 'operation ID (bytes32 hash)')
  .action(async (timelock?: Address, operationIdInput?: string) => {
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

    if (isHex(operationIdInput)) {
      operationId = operationIdInput;
    } else {
      operationId = stringToHex(operationIdInput);
    }

    const timelockContract = await getTimeLockContract(timelock);
    const publicClient = await getPublicClient();
    const currentBlock = await publicClient.getBlock({ blockTag: 'latest' });
    const now = currentBlock.timestamp;

    const [state, timestamp, isOp, isPending, isReady, isDone] =
      await Promise.all([
        callReadMethodSilent(timelockContract, 'getOperationState', [
          operationId,
        ]),
        callReadMethodSilent(timelockContract, 'getTimestamp', [operationId]),
        callReadMethodSilent(timelockContract, 'isOperation', [operationId]),
        callReadMethodSilent(timelockContract, 'isOperationPending', [
          operationId,
        ]),
        callReadMethodSilent(timelockContract, 'isOperationReady', [
          operationId,
        ]),
        callReadMethodSilent(timelockContract, 'isOperationDone', [
          operationId,
        ]),
      ]);

    const stateNames = ['Unset', 'Waiting', 'Ready', 'Done'];
    const stateName = stateNames[state] || 'Unknown';

    const waitTime =
      timestamp > 0n && timestamp !== 1n && timestamp > now
        ? timestamp - now
        : 0n;
    const readyDate =
      timestamp > 0n && timestamp !== 1n
        ? new Date(Number(timestamp) * 1000).toLocaleString()
        : 'N/A';

    logResult({
      data: [
        ['Operation ID', operationId],
        ['State', `${state} (${stateName})`],
        ['Timestamp', timestamp.toString()],
        ['Ready Date', readyDate],
        ['Is Operation', isOp ? '✅ Yes' : '❌ No'],
        ['Is Pending', isPending ? '✅ Yes' : '❌ No'],
        ['Is Ready', isReady ? '✅ Yes' : '❌ No'],
        ['Is Done', isDone ? '✅ Yes' : '❌ No'],
        ['Current Block Timestamp', now.toString()],
        ['Wait Time (seconds)', waitTime.toString()],
      ],
    });
  });

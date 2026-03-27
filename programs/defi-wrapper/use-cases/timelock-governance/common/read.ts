import { Option } from 'commander';
import {
  logInfo,
  getCommandsJson,
  stringToAddress,
  callReadMethodSilent,
  logResult,
  addressPrompt,
  logError,
  stringToBigInt,
} from 'utils';
import { common } from './main.js';
import { Address, decodeFunctionData, Hash } from 'viem';
import { getStvPoolContract } from 'contracts/defi-wrapper/index.js';
import {
  getPromptTimelock,
  OPERATION_ID_ARGUMENT,
  promptOperationId,
  TIMELOCK_ARGUMENT,
  waitTimeTo,
} from 'features/defi-wrapper/timelock.js';

import { getPublicClient } from 'providers';

import { DashboardAbi } from 'abi';
import {
  StvPoolAbi,
  StvStETHPoolAbi,
  WithdrawalQueueAbi,
  TimeLockAbi,
  OssifiableProxyAbi,
  DistributorAbi,
} from 'abi/defi-wrapper/index.js';

// all abis of expected timelock governed contracts
const mixAbi = [
  ...DashboardAbi,
  ...StvPoolAbi,
  ...StvStETHPoolAbi,
  ...WithdrawalQueueAbi,
  ...OssifiableProxyAbi,
  ...TimeLockAbi,
  ...DistributorAbi,
];

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
  .command('get-timelock-address')
  .description(
    'get address of timelock governance contract based on pool address',
  )
  .argument('[pool]', 'pool contract address', stringToAddress)
  .action(async (pool?: Address) => {
    if (!pool) {
      const poolPrompt = await addressPrompt(
        'Enter pool contract address',
        'pool',
      );
      pool = poolPrompt.pool as Address;
    }
    const stvPoolContract = await getStvPoolContract(pool);
    const defaultAdminRole = await callReadMethodSilent({
      contract: stvPoolContract,
      methodName: 'DEFAULT_ADMIN_ROLE',
      payload: [],
    });

    const admins = await callReadMethodSilent({
      contract: stvPoolContract,
      methodName: 'getRoleMembers',
      payload: [[defaultAdminRole]],
    });

    if (admins.length === 0) {
      logError('No timelock governance found for the pool');
      return;
    }

    if (admins.length === 1) {
      logResult({
        data: [['Timelock Governance Address', admins[0]]],
      });
    }

    if (admins.length > 1) {
      logError('Multiple admins found for the pool; Invalid configuration:');
      const data = admins.map((addr, index) => [`Admin ${index + 1}`, addr]);
      logResult({ data });
    }
  });

commonRead
  .command('get-last-operations')
  .description('get last timelock operations')
  .argument(...TIMELOCK_ARGUMENT)
  .option(
    '-n, --number <number>',
    'number of blocks to look back',
    stringToBigInt,
    5000n,
  )
  .action(
    async (
      timelockAddress: Address | undefined,
      options: { number: bigint },
    ) => {
      const client = await getPublicClient();
      const timelock = await getPromptTimelock(timelockAddress);
      const currentBlock = await client.getBlock({ blockTag: 'latest' });

      const toBlock = currentBlock.number;
      let fromBlock = toBlock - options.number;
      if (fromBlock < 0n) fromBlock = 0n;

      const events = await timelock.getEvents.CallScheduled(undefined, {
        toBlock,
        fromBlock,
        strict: true as const,
      } as const);

      logInfo(
        `Found ${events.length} CallScheduled events from block ${fromBlock} to ${toBlock}:`,
      );

      for (const event of events) {
        const { data, delay, id, index, predecessor, target, value } =
          event.args as Required<typeof event.args>;

        let waitTime = 0n;
        const timestamp = 0n;

        const state = await callReadMethodSilent({
          contract: timelock,
          methodName: 'getOperationState',
          payload: [[id]],
        });

        if (state === 1) {
          const timestamp = await callReadMethodSilent({
            contract: timelock,
            methodName: 'getTimestamp',
            payload: [[id]],
          });

          waitTime = waitTimeTo(timestamp);
        }

        const stateNames = ['Unset', 'Waiting', 'Ready', 'Done'];
        const stateName = stateNames[state] || 'Unknown';

        let args, functionName;

        try {
          const decodeResult = decodeFunctionData({
            abi: mixAbi,
            data,
          });
          args = decodeResult.args;
          functionName = decodeResult.functionName;
        } catch {
          args = [];
          functionName = 'Unknown function';
        }

        logResult({
          data: [
            ['Operation ID', id],
            ['Operation Index', index.toString()],
            ['State', stateName],
            ['Target', target],
            ['Value (ETH)', value.toString()],
            ['Data', data],
            ['Function', functionName],
            [
              'Arguments',
              JSON.stringify(args, (_key, value) =>
                typeof value === 'bigint' ? value.toString() + 'n' : value,
              ),
            ],

            ['Delay (seconds)', delay.toString()],
            ['Predecessor', predecessor],
            ['Wait Time (seconds)', waitTime.toString()],
            ['Ready Timestamp', timestamp.toString()],
          ],
        });
      }
    },
  );

commonRead
  .command('get-operation-state')
  .description('get the state of a timelock operation')
  .argument(...TIMELOCK_ARGUMENT)
  .argument(...OPERATION_ID_ARGUMENT)
  .action(async (timelock?: Address, operationIdInput?: Hash) => {
    const timelockContract = await getPromptTimelock(timelock);

    const operationId = await promptOperationId(operationIdInput);

    const state = await callReadMethodSilent({
      contract: timelockContract,
      methodName: 'getOperationState',
      payload: [[operationId]],
    });

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
      const timestamp = await callReadMethodSilent({
        contract: timelockContract,
        methodName: 'getTimestamp',
        payload: [[operationId]],
      });

      const waitTime = waitTimeTo(timestamp);
      logInfo(
        `Will be ready at timestamp ${timestamp} (in ${waitTime} seconds)`,
      );
    }
  });

commonRead
  .command('get-timestamp')
  .description('get the timestamp when an operation will be ready')
  .argument(...TIMELOCK_ARGUMENT)
  .argument(...OPERATION_ID_ARGUMENT)
  .action(async (timelock?: Address, operationIdInput?: Hash) => {
    const timelockContract = await getPromptTimelock(timelock);

    const operationId = await promptOperationId(operationIdInput);
    const timestamp = await callReadMethodSilent({
      contract: timelockContract,
      methodName: 'getTimestamp',
      payload: [[operationId]],
    });

    const waitTime = waitTimeTo(timestamp);
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
  .argument(...TIMELOCK_ARGUMENT)
  .action(async (timelock?: Address) => {
    const timelockContract = await getPromptTimelock(timelock);

    const minDelay = await callReadMethodSilent({
      contract: timelockContract,
      methodName: 'getMinDelay',
      payload: [],
    });

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
  .argument(...TIMELOCK_ARGUMENT)
  .argument(...OPERATION_ID_ARGUMENT)
  .action(async (timelock?: Address, operationIdInput?: Hash) => {
    const timelockContract = await getPromptTimelock(timelock);

    const operationId = await promptOperationId(operationIdInput);

    const isOp = await callReadMethodSilent({
      contract: timelockContract,
      methodName: 'isOperation',
      payload: [[operationId]],
    });

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
  .argument(...TIMELOCK_ARGUMENT)
  .argument(...OPERATION_ID_ARGUMENT)
  .action(async (timelock?: Address, operationIdInput?: Hash) => {
    const timelockContract = await getPromptTimelock(timelock);

    const operationId = await promptOperationId(operationIdInput);
    const isPending = await callReadMethodSilent({
      contract: timelockContract,
      methodName: 'isOperationPending',
      payload: [[operationId]],
    });

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
  .argument(...TIMELOCK_ARGUMENT)
  .argument(...OPERATION_ID_ARGUMENT)
  .action(async (timelock?: Address, operationIdInput?: Hash) => {
    const timelockContract = await getPromptTimelock(timelock);

    const operationId = await promptOperationId(operationIdInput);

    const isReady = await callReadMethodSilent({
      contract: timelockContract,
      methodName: 'isOperationReady',
      payload: [[operationId]],
    });

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
  .argument(...TIMELOCK_ARGUMENT)
  .argument(...OPERATION_ID_ARGUMENT)
  .action(async (timelock?: Address, operationIdInput?: Hash) => {
    const timelockContract = await getPromptTimelock(timelock);

    const operationId = await promptOperationId(operationIdInput);

    const isDone = await callReadMethodSilent({
      contract: timelockContract,
      methodName: 'isOperationDone',
      payload: [[operationId]],
    });

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
  .argument(...TIMELOCK_ARGUMENT)
  .argument(...OPERATION_ID_ARGUMENT)
  .action(async (timelock?: Address, operationIdInput?: Hash) => {
    const timelockContract = await getPromptTimelock(timelock);

    const operationId = await promptOperationId(operationIdInput);

    const publicClient = await getPublicClient();
    const currentBlock = await publicClient.getBlock({ blockTag: 'latest' });
    const now = currentBlock.timestamp;

    const [state, timestamp, isOp, isPending, isReady, isDone] =
      await Promise.all([
        callReadMethodSilent({
          contract: timelockContract,
          methodName: 'getOperationState',
          payload: [[operationId]],
        }),
        callReadMethodSilent({
          contract: timelockContract,
          methodName: 'getTimestamp',
          payload: [[operationId]],
        }),
        callReadMethodSilent({
          contract: timelockContract,
          methodName: 'isOperation',
          payload: [[operationId]],
        }),
        callReadMethodSilent({
          contract: timelockContract,
          methodName: 'isOperationPending',
          payload: [[operationId]],
        }),
        callReadMethodSilent({
          contract: timelockContract,
          methodName: 'isOperationReady',
          payload: [[operationId]],
        }),
        callReadMethodSilent({
          contract: timelockContract,
          methodName: 'isOperationDone',
          payload: [[operationId]],
        }),
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

import { Option } from 'commander';

import {
  logInfo,
  getCommandsJson,
  stringToAddress,
  callWriteMethodWithReceipt,
  confirmOperation,
  stringToBigInt,
  stringToBigIntArray,
} from 'utils';

import { withdrawalQueue } from './main.js';
import { Address } from 'viem';
import { getWithdrawalQueueContract } from 'contracts/defi-wrapper/index.js';

const withdrawalQueueWrite = withdrawalQueue
  .command('write')
  .alias('w')
  .description('withdrawal queue write commands');

withdrawalQueueWrite.addOption(new Option('-cmd2json'));
withdrawalQueueWrite.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(withdrawalQueueWrite));
  process.exit();
});

withdrawalQueueWrite
  .command('pause')
  .description('pause withdrawal requests placement and finalization')
  .argument('<address>', 'withdrawal queue address', stringToAddress)
  .action(async (address: Address) => {
    const contract = getWithdrawalQueueContract(address);

    const confirmationMessage = `Are you sure you want to pause withdrawal requests placement and finalization for the withdrawal queue ${address}?`;
    const confirm = await confirmOperation(confirmationMessage);
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'pause',
      payload: [],
    });
  });

withdrawalQueueWrite
  .command('resume')
  .description('resume withdrawal requests placement and finalization')
  .argument('<address>', 'withdrawal queue address', stringToAddress)
  .action(async (address: Address) => {
    const contract = getWithdrawalQueueContract(address);

    const confirmationMessage = `Are you sure you want to resume withdrawal requests placement and finalization for the withdrawal queue ${address}?`;
    const confirm = await confirmOperation(confirmationMessage);
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'resume',
      payload: [],
    });
  });

withdrawalQueueWrite
  .command('request-withdrawals')
  .description('request multiple withdrawals for a user')
  .argument('<address>', 'withdrawal queue address', stringToAddress)
  .argument('<stv>', 'array of amounts of stv to withdraw', stringToBigIntArray)
  .argument(
    '<steth>',
    'array of amounts of stETH shares to rebalance',
    stringToBigIntArray,
  )
  .argument(
    '<address>',
    'address that will be able to claim the created request',
    stringToAddress,
  )
  .action(
    async (
      address: Address,
      stvToWithdraw: bigint[],
      stethSharesToRebalance: bigint[],
      owner: Address,
    ) => {
      const contract = getWithdrawalQueueContract(address);

      const confirmationMessage = `Are you sure you want to request multiple withdrawals for ${owner} with ${stvToWithdraw.join(', ')} stv and ${stethSharesToRebalance.join(', ')} steth shares for the withdrawal queue ${address}?`;
      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'requestWithdrawals',
        payload: [stvToWithdraw, stethSharesToRebalance, owner],
      });
    },
  );

withdrawalQueueWrite
  .command('request-withdrawal')
  .description('request a withdrawal for a user')
  .argument('<address>', 'withdrawal queue address', stringToAddress)
  .argument('<stv>', 'amount of stv to withdraw', stringToBigInt)
  .argument('<steth>', 'amount of steth shares to rebalance', stringToBigInt)
  .argument(
    '<address>',
    'address that will be able to claim the created request',
    stringToAddress,
  )
  .action(
    async (
      address: Address,
      stvToWithdraw: bigint,
      stethSharesToRebalance: bigint,
      owner: Address,
    ) => {
      const contract = getWithdrawalQueueContract(address);

      const confirmationMessage = `Are you sure you want to request a withdrawal for ${owner} with ${stvToWithdraw} stv and ${stethSharesToRebalance} steth shares for the withdrawal queue ${address}?`;
      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'requestWithdrawal',
        payload: [stvToWithdraw, stethSharesToRebalance, owner],
      });
    },
  );

withdrawalQueueWrite
  .command('finalize')
  .description('finalize withdrawal requests')
  .argument('<address>', 'withdrawal queue address', stringToAddress)
  .argument(
    '<maxRequests>',
    'the maximum number of requests to finalize',
    stringToBigInt,
  )
  .action(async (address: Address, maxRequests: bigint) => {
    const contract = getWithdrawalQueueContract(address);

    const confirmationMessage = `Are you sure you want to finalize up to ${maxRequests} withdrawal requests for the withdrawal queue ${address}?`;
    const confirm = await confirmOperation(confirmationMessage);
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'finalize',
      payload: [maxRequests],
    });
  });

withdrawalQueueWrite
  .command('claim-withdrawal')
  .description(
    'claim one `_requestId` request once finalized sending locked ether to the owner',
  )
  .argument('<address>', 'withdrawal queue address', stringToAddress)
  .argument('<requestId>', 'request id to claim', stringToBigInt)
  .argument(
    '<requestor>',
    'address of the request owner, should be equal to msg.sender on Wrapper side',
    stringToAddress,
  )
  .argument(
    '<recipient>',
    'address where claimed ether will be sent to',
    stringToAddress,
  )
  .action(
    async (
      address: Address,
      requestId: bigint,
      requestor: Address,
      recipient: Address,
    ) => {
      const contract = getWithdrawalQueueContract(address);

      const confirmationMessage = `Are you sure you want to claim request ${requestId} for ${requestor} and send the claimed ether to ${recipient} for the withdrawal queue ${address}?`;
      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'claimWithdrawal',
        payload: [requestId, requestor, recipient],
      });
    },
  );

withdrawalQueueWrite
  .command('claim-withdrawals')
  .description(
    'claim one `_requestId` request once finalized sending locked ether to the owner',
  )
  .argument('<address>', 'withdrawal queue address', stringToAddress)
  .argument(
    '<requestIds>',
    'array of request ids to claim',
    stringToBigIntArray,
  )
  .argument(
    '<hints>',
    'checkpoint hints. can be found with `findCheckpointHints(_requestIds, 1, getLastCheckpointIndex())`',
    stringToBigIntArray,
  )
  .argument(
    '<requestor>',
    'address of the request owner, should be equal to msg.sender on Wrapper side',
    stringToAddress,
  )
  .argument(
    '<recipient>',
    'address where claimed ether will be sent to',
    stringToAddress,
  )
  .action(
    async (
      address: Address,
      requestIds: bigint[],
      hints: bigint[],
      requestor: Address,
      recipient: Address,
    ) => {
      const contract = getWithdrawalQueueContract(address);

      const confirmationMessage = `Are you sure you want to claim requests ${requestIds.join(', ')} for ${requestor} and send the claimed ether to ${recipient} for the withdrawal queue ${address}?`;
      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'claimWithdrawals',
        payload: [requestIds, hints, requestor, recipient],
      });
    },
  );

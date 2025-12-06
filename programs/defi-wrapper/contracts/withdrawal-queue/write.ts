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
    const contract = await getWithdrawalQueueContract(address);

    const confirmationMessage = `Are you sure you want to pause withdrawal requests placement and finalization for the withdrawal queue ${address}?`;
    const confirm = await confirmOperation(confirmationMessage);
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'pauseWithdrawals',
      payload: [],
    });
  });

withdrawalQueueWrite
  .command('resume')
  .description('resume withdrawal requests placement and finalization')
  .argument('<address>', 'withdrawal queue address', stringToAddress)
  .action(async (address: Address) => {
    const contract = await getWithdrawalQueueContract(address);

    const confirmationMessage = `Are you sure you want to resume withdrawal requests placement and finalization for the withdrawal queue ${address}?`;
    const confirm = await confirmOperation(confirmationMessage);
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'resumeWithdrawals',
      payload: [],
    });
  });

withdrawalQueueWrite
  .command('pause-finalization')
  .description('pause withdrawal requests finalization')
  .argument('<address>', 'withdrawal queue address', stringToAddress)
  .action(async (address: Address) => {
    const contract = await getWithdrawalQueueContract(address);

    const confirmationMessage = `Are you sure you want to pause withdrawal requests finalization for the withdrawal queue ${address}?`;
    const confirm = await confirmOperation(confirmationMessage);
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'pauseFinalization',
      payload: [],
    });
  });

withdrawalQueueWrite
  .command('resume-finalization')
  .description('resume withdrawal requests finalization')
  .argument('<address>', 'withdrawal queue address', stringToAddress)
  .action(async (address: Address) => {
    const contract = await getWithdrawalQueueContract(address);

    const confirmationMessage = `Are you sure you want to resume withdrawal requests finalization for the withdrawal queue ${address}?`;
    const confirm = await confirmOperation(confirmationMessage);
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'resumeFinalization',
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
      const contract = await getWithdrawalQueueContract(address);

      const confirmationMessage = `Are you sure you want to request multiple withdrawals for ${owner} with ${stvToWithdraw.join(', ')} stv and ${stethSharesToRebalance.join(', ')} steth shares for the withdrawal queue ${address}?`;
      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'requestWithdrawalBatch',
        payload: [owner, stvToWithdraw, stethSharesToRebalance],
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
      const contract = await getWithdrawalQueueContract(address);

      const confirmationMessage = `Are you sure you want to request a withdrawal for ${owner} with ${stvToWithdraw} stv and ${stethSharesToRebalance} steth shares for the withdrawal queue ${address}?`;
      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'requestWithdrawal',
        payload: [owner, stvToWithdraw, stethSharesToRebalance],
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
  .argument(
    '<gasCostCoverageRecipient>',
    'address to receive gas cost coverage',
    stringToAddress,
  )
  .action(
    async (
      address: Address,
      maxRequests: bigint,
      gasCostCoverageRecipient: Address,
    ) => {
      const contract = await getWithdrawalQueueContract(address);

      const confirmationMessage = `Are you sure you want to finalize up to ${maxRequests} withdrawal requests for the withdrawal queue ${address} to ${gasCostCoverageRecipient}?`;
      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'finalize',
        payload: [maxRequests, gasCostCoverageRecipient],
      });
    },
  );

withdrawalQueueWrite
  .command('claim-withdrawal')
  .description(
    'claim one `_requestId` request once finalized sending locked ether to the owner',
  )
  .argument('<address>', 'withdrawal queue address', stringToAddress)
  .argument('<requestId>', 'request id to claim', stringToBigInt)
  .argument(
    '<recipient>',
    'address where claimed ether will be sent to',
    stringToAddress,
  )
  .action(async (address: Address, requestId: bigint, recipient: Address) => {
    const contract = await getWithdrawalQueueContract(address);

    const confirmationMessage = `Are you sure you want to claim request ${requestId} and send the claimed ether to ${recipient} for the withdrawal queue ${address}?`;
    const confirm = await confirmOperation(confirmationMessage);
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'claimWithdrawal',
      payload: [recipient, requestId],
    });
  });

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
    '<recipient>',
    'address where claimed ether will be sent to',
    stringToAddress,
  )
  .action(
    async (
      address: Address,
      requestIds: bigint[],
      hints: bigint[],
      recipient: Address,
    ) => {
      const contract = await getWithdrawalQueueContract(address);

      const confirmationMessage = `Are you sure you want to claim requests ${requestIds.join(', ')} and send the claimed ether to ${recipient} for the withdrawal queue ${address}?`;
      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'claimWithdrawalBatch',
        payload: [recipient, requestIds, hints],
      });
    },
  );

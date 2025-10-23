import { Option } from 'commander';

import {
  logInfo,
  getCommandsJson,
  stringToAddress,
  callWriteMethodWithReceipt,
  etherToWei,
  confirmOperation,
  stringToBigInt,
  stringToBigIntArray,
  stringToHexArray,
} from 'utils';
import { getAccount } from 'providers';

import { stvPool } from './main.js';
import { Address, formatEther, Hex } from 'viem';
import { getStvPoolContract } from 'contracts/defi-wrapper/index.js';

const stvPoolWrite = stvPool
  .command('write')
  .alias('w')
  .description('stv pool write commands');

stvPoolWrite.addOption(new Option('-cmd2json'));
stvPoolWrite.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(stvPoolWrite));
  process.exit();
});

stvPoolWrite
  .command('deposit-eth')
  .description('convenience function to deposit ETH to msg.sender')
  .argument('<address>', 'distributor address', stringToAddress)
  .option(
    '-r, --referral <referral>',
    'address of the referral (if any)',
    stringToAddress,
  )
  .option(
    '-s, --receiver <receiver>',
    'address to receive the minted shares',
    stringToAddress,
  )
  .action(
    async (
      address: Address,
      { referral, receiver }: { referral: Address; receiver: Address },
    ) => {
      const contract = getStvPoolContract(address);

      const confirmationMessage = `Are you sure you want to deposit ETH to the stv pool? (referral: ${referral})`;
      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      const payload: Address[] = [];
      if (receiver) payload.push(receiver);
      if (referral) payload.push(referral);

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'depositETH',
        payload: payload as any,
      });
    },
  );

stvPoolWrite
  .command('rebalance-unassigned-liability')
  .description(
    'rebalance unassigned liability by repaying it with assets held by the vault',
  )
  .argument('<address>', 'distributor address', stringToAddress)
  .argument(
    '<stethShares>',
    'amount of stETH shares to rebalance (in shares)',
    stringToBigInt,
  )
  .action(async (address: Address, stethShares: bigint) => {
    const contract = getStvPoolContract(address);

    const confirmationMessage = `Are you sure you want to rebalance unassigned liability with ${stethShares} stETH shares?`;
    const confirm = await confirmOperation(confirmationMessage);
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'rebalanceUnassignedLiability',
      payload: [stethShares],
    });
  });

stvPoolWrite
  .command('rebalance-unassigned-liability-with-ether')
  .description(
    'rebalance unassigned liability by repaying it with external ether',
  )
  .argument('<address>', 'distributor address', stringToAddress)
  .argument('<ether>', 'amount of ether to rebalance (in ETH)', etherToWei)
  .action(async (address: Address, ether: bigint) => {
    const contract = getStvPoolContract(address);

    const confirmationMessage = `Are you sure you want to rebalance unassigned liability with ${formatEther(ether)} ether?`;
    const confirm = await confirmOperation(confirmationMessage);
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'rebalanceUnassignedLiabilityWithEther',
      payload: [],
      value: ether,
    });
  });

stvPoolWrite
  .command('request-withdrawal-eth')
  .description(
    'request a withdrawal by specifying the amount of assets to withdraw',
  )
  .argument('<address>', 'distributor address', stringToAddress)
  .argument(
    '<assetsToWithdraw>',
    'the amount of assets to withdraw (18 decimals)',
    stringToBigInt,
  )
  .action(async (address: Address, assetsToWithdraw: bigint) => {
    const contract = getStvPoolContract(address);

    const confirmationMessage = `Are you sure you want to request a withdrawal of ${assetsToWithdraw} assets?`;
    const confirm = await confirmOperation(confirmationMessage);
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'requestWithdrawalETH',
      payload: [assetsToWithdraw],
    });
  });

stvPoolWrite
  .command('request-withdrawal')
  .description(
    'request a withdrawal by specifying the amount of stv to withdraw',
  )
  .argument('<address>', 'distributor address', stringToAddress)
  .argument(
    '<stvToWithdraw>',
    'the amount of stv to withdraw (27 decimals)',
    stringToBigInt,
  )
  .option(
    '-r, --receiver <receiver>',
    'the address to receive the claimed ether, or address(0)',
    stringToAddress,
  )
  .action(
    async (
      address: Address,
      stvToWithdraw: bigint,
      { receiver }: { receiver: Address },
    ) => {
      const contract = getStvPoolContract(address);
      const account = await getAccount();

      const confirmationMessage = `Are you sure you want to request a withdrawal of ${stvToWithdraw} stv to ${receiver}?`;
      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'requestWithdrawal',
        payload: [stvToWithdraw, receiver || account.address],
      });
    },
  );

stvPoolWrite
  .command('request-withdrawals')
  .description(
    'request multiple withdrawals by specifying the amounts of stv to withdraw',
  )
  .argument('<address>', 'distributor address', stringToAddress)
  .argument(
    '<stvToWithdraw>',
    'the array of amounts of stv to withdraw (27 decimals)',
    stringToBigIntArray,
  )
  .option(
    '-r, --receiver <receiver>',
    'the address to receive the claimed ether, or address(0)',
    stringToAddress,
  )
  .action(
    async (
      address: Address,
      stvToWithdraw: bigint[],
      { receiver }: { receiver: Address },
    ) => {
      const contract = getStvPoolContract(address);
      const account = await getAccount();

      const confirmationMessage = `Are you sure you want to request multiple withdrawals of ${stvToWithdraw.join(', ')} stv to ${receiver}?`;
      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'requestWithdrawals',
        payload: [stvToWithdraw, receiver || account.address],
      });
    },
  );

stvPoolWrite
  .command('claim-withdrawal')
  .description('claim finalized withdrawal request')
  .argument('<address>', 'distributor address', stringToAddress)
  .argument('<requestId>', 'the withdrawal request ID to claim', stringToBigInt)
  .option(
    '-r, --receiver <receiver>',
    'the address to receive the claimed ether, or address(0)',
    stringToAddress,
  )
  .action(
    async (
      address: Address,
      requestId: bigint,
      { receiver }: { receiver: Address },
    ) => {
      const contract = getStvPoolContract(address);
      const account = await getAccount();

      const confirmationMessage = `Are you sure you want to claim withdrawal request ${requestId} to ${receiver}?`;
      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'claimWithdrawal',
        payload: [requestId, receiver || account.address],
      });
    },
  );

stvPoolWrite
  .command('claim-withdrawals')
  .description('claim multiple finalized withdrawal requests')
  .argument('<address>', 'distributor address', stringToAddress)
  .argument(
    '<requestIds>',
    'the array of withdrawal request IDs to claim',
    stringToBigIntArray,
  )
  .argument(
    '<hints>',
    'the checkpoint hints. Can be found with `WQ.findCheckpointHints(_requestIds, 1, getLastCheckpointIndex())`',
    stringToBigIntArray,
  )
  .option(
    '-r, --receiver <receiver>',
    'the address to receive the claimed ether, or address(0)',
    stringToAddress,
  )
  .action(
    async (
      address: Address,
      requestIds: bigint[],
      hints: bigint[],
      { receiver }: { receiver: Address },
    ) => {
      const contract = getStvPoolContract(address);
      const account = await getAccount();

      const confirmationMessage = `Are you sure you want to claim withdrawal requests ${requestIds.join(', ')} to ${receiver}?`;
      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'claimWithdrawals',
        payload: [requestIds, hints, receiver || account.address],
      });
    },
  );

stvPoolWrite
  .command('burn-stv-for-withdrawal-queue')
  .description(
    'burn stv from WithdrawalQueue contract when processing withdrawal requests',
  )
  .argument('<address>', 'distributor address', stringToAddress)
  .argument('<stv>', 'amount of stv to burn (27 decimals)', stringToBigInt)
  .action(async (address: Address, stv: bigint) => {
    const contract = getStvPoolContract(address);

    const confirmationMessage = `Are you sure you want to burn ${stv} stv for the withdrawal queue ${address}?`;
    const confirm = await confirmOperation(confirmationMessage);
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'burnStvForWithdrawalQueue',
      payload: [stv],
    });
  });

stvPoolWrite
  .command('disconnect-vault')
  .description('initiates voluntary vault disconnection from VaultHub')
  .argument('<address>', 'distributor address', stringToAddress)
  .action(async (address: Address) => {
    const contract = getStvPoolContract(address);

    const confirmationMessage = `Are you sure you want to disconnect the vault ${address}?`;
    const confirm = await confirmOperation(confirmationMessage);
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'disconnectVault',
      payload: [],
    });
  });

stvPoolWrite
  .command('claim-connect-deposit')
  .description('claims the connect deposit after vault has been disconnected')
  .argument('<address>', 'distributor address', stringToAddress)
  .option(
    '-r, --receiver <receiver>',
    'the address to receive the claimed ether, or address(0)',
    stringToAddress,
  )
  .action(async (address: Address, { receiver }: { receiver: Address }) => {
    const contract = getStvPoolContract(address);
    const account = await getAccount();

    const confirmationMessage = `Are you sure you want to claim the connect deposit for the vault ${address} to ${receiver}?`;
    const confirm = await confirmOperation(confirmationMessage);
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'claimConnectDeposit',
      payload: [receiver || account.address],
    });
  });

stvPoolWrite
  .command('trigger-validator-withdrawals')
  .description('triggers validator withdrawals')
  .argument('<address>', 'distributor address', stringToAddress)
  .argument('<pubkeys>', 'validator public keys', stringToHexArray)
  .argument('<amounts>', 'amounts to withdraw (in ETH)', stringToBigIntArray)
  .argument('<refundRecipient>', 'refund recipient address', stringToAddress)
  .action(
    async (
      address: Address,
      pubkeys: Hex[],
      amounts: bigint[],
      refundRecipient: Address,
    ) => {
      const contract = getStvPoolContract(address);

      const confirmationMessage = `Are you sure you want to trigger validator withdrawals for the vault ${address} with pubkeys ${pubkeys.join(', ')} and amounts ${amounts.map((amount) => formatEther(amount)).join(', ')} to ${refundRecipient}?`;
      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'triggerValidatorWithdrawals',
        payload: [pubkeys.join('') as Hex, amounts, refundRecipient],
      });
    },
  );

stvPoolWrite
  .command('request-validator-exit')
  .description('requests validator exit')
  .argument('<address>', 'distributor address', stringToAddress)
  .argument('<pubkeys>', 'validator public keys', stringToHexArray)
  .action(async (address: Address, pubkeys: Hex[]) => {
    const contract = getStvPoolContract(address);

    const confirmationMessage = `Are you sure you want to request validator exit for the vault ${address} with pubkeys ${pubkeys.join(', ')}?`;
    const confirm = await confirmOperation(confirmationMessage);
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'requestValidatorExit',
      payload: [pubkeys.join('') as Hex],
    });
  });

stvPoolWrite
  .command('add-to-allow-list')
  .description('add an address to the allowlist')
  .argument('<address>', 'distributor address', stringToAddress)
  .argument('<user>', 'address to add to the allowlist', stringToAddress)
  .action(async (address: Address, user: Address) => {
    const contract = getStvPoolContract(address);

    const confirmationMessage = `Are you sure you want to add ${user} to the allowlist for the vault ${address}?`;
    const confirm = await confirmOperation(confirmationMessage);
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'addToAllowList',
      payload: [user],
    });
  });

stvPoolWrite
  .command('remove-from-allow-list')
  .description('remove an address from the allowlist')
  .argument('<address>', 'distributor address', stringToAddress)
  .argument('<user>', 'address to remove from the allowlist', stringToAddress)
  .action(async (address: Address, user: Address) => {
    const contract = getStvPoolContract(address);

    const confirmationMessage = `Are you sure you want to remove ${user} from the allowlist for the vault ${address}?`;
    const confirm = await confirmOperation(confirmationMessage);
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'removeFromAllowList',
      payload: [user],
    });
  });

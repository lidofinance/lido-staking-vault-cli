import { Option } from 'commander';

import {
  logInfo,
  getCommandsJson,
  stringToAddress,
  callWriteMethodWithReceipt,
  etherToWei,
  confirmOperation,
  stringToBigInt,
} from 'utils';
import { getAccount } from 'providers';

import { stvPool } from './main.js';
import { Address, formatEther } from 'viem';
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
  .argument('<address>', 'pool address', stringToAddress)
  .argument('<amount>', 'amount of ETH to deposit (in ETH)', etherToWei)
  .argument('<referral>', 'address of the referral (if any)', stringToAddress)
  .option(
    '-s, --receiver <receiver>',
    'address to receive the minted shares',
    stringToAddress,
  )
  .action(
    async (
      address: Address,
      amount: bigint,
      referral: Address,
      { receiver }: { receiver: Address },
    ) => {
      const contract = getStvPoolContract(address);
      const account = await getAccount();

      const confirmationMessage = `Are you sure you want to deposit ETH to the stv pool? (referral: ${referral}, receiver: ${receiver || account.address}, amount: ${formatEther(amount)})`;
      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'depositETH',
        payload: [receiver || account.address, referral],
        value: amount,
      });
    },
  );

stvPoolWrite
  .command('rebalance-unassigned-liability')
  .description(
    'rebalance unassigned liability by repaying it with assets held by the vault',
  )
  .argument('<address>', 'pool address', stringToAddress)
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
  .argument('<address>', 'pool address', stringToAddress)
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
  .command('transfer-from-for-withdrawal-queue')
  .description(
    'transfer stv from user to WithdrawalQueue contract when enqueuing withdrawal requests',
  )
  .argument('<address>', 'pool address', stringToAddress)
  .argument('<from>', 'address of the user', stringToAddress)
  .argument(
    '<stv>',
    'the amount of assets to transfer (18 decimals)',
    stringToBigInt,
  )
  .action(async (address: Address, from: Address, stv: bigint) => {
    const contract = getStvPoolContract(address);

    const confirmationMessage = `Are you sure you want to transfer ${stv} stv from ${from} to the withdrawal queue ${address}?`;
    const confirm = await confirmOperation(confirmationMessage);
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'transferFromForWithdrawalQueue',
      payload: [from, stv],
    });
  });

stvPoolWrite
  .command('pause-deposits')
  .description('pause deposits')
  .argument('<address>', 'pool address', stringToAddress)
  .action(async (address: Address) => {
    const contract = getStvPoolContract(address);

    const confirmationMessage = `Are you sure you want to pause deposits for the pool ${address}?`;
    const confirm = await confirmOperation(confirmationMessage);
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'pauseDeposits',
      payload: [],
    });
  });

stvPoolWrite
  .command('resume-deposits')
  .description('resume deposits')
  .argument('<address>', 'pool address', stringToAddress)
  .action(async (address: Address) => {
    const contract = getStvPoolContract(address);

    const confirmationMessage = `Are you sure you want to resume deposits for the pool ${address}?`;
    const confirm = await confirmOperation(confirmationMessage);
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'resumeDeposits',
      payload: [],
    });
  });

stvPoolWrite
  .command('burn-stv-for-withdrawal-queue')
  .description(
    'burn stv from WithdrawalQueue contract when processing withdrawal requests',
  )
  .argument('<address>', 'pool address', stringToAddress)
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
  .command('add-to-allow-list')
  .description('add an address to the allowlist')
  .argument('<address>', 'pool address', stringToAddress)
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
  .argument('<address>', 'pool address', stringToAddress)
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

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

import { stvStrategyPool } from './main.js';
import { Address, formatEther, Hex } from 'viem';
import { getStvStrategyPoolContract } from 'contracts/defi-wrapper/index.js';

const stvStrategyPoolWrite = stvStrategyPool
  .command('write')
  .alias('w')
  .description('write commands');

stvStrategyPoolWrite.addOption(new Option('-cmd2json'));
stvStrategyPoolWrite.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(stvStrategyPoolWrite));
  process.exit();
});

stvStrategyPoolWrite
  .command('deposit-eth')
  .description('convenience function to deposit ETH to msg.sender')
  .argument('<address>', 'distributor address', stringToAddress)
  .argument(
    '<referral>',
    'the address of the referral (if any)',
    stringToAddress,
  )
  .argument(
    '<receiver>',
    'the address to receive the minted shares',
    stringToAddress,
  )
  .argument(
    '<stethSharesToMint>',
    'amount of stETH shares to mint (up to maximum capacity for this deposit). Pass MAX_MINTABLE_AMOUNT to mint maximum available for this deposit',
    stringToBigInt,
  )
  .action(
    async (
      address: Address,
      referral: Address,
      receiver: Address,
      stethSharesToMint: bigint,
    ) => {
      const contract = getStvStrategyPoolContract(address);

      const confirmationMessage = `Are you sure you want to deposit ETH to the stv pool? (referral: ${referral}, receiver: ${receiver}, stethSharesToMint: ${stethSharesToMint})`;
      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'depositETH',
        payload: [referral, receiver, stethSharesToMint],
      });
    },
  );

stvStrategyPoolWrite
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
    const contract = getStvStrategyPoolContract(address);

    const confirmationMessage = `Are you sure you want to rebalance unassigned liability with ${stethShares} stETH shares?`;
    const confirm = await confirmOperation(confirmationMessage);
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'rebalanceUnassignedLiability',
      payload: [stethShares],
    });
  });

stvStrategyPoolWrite
  .command('rebalance-unassigned-liability-with-ether')
  .description(
    'rebalance unassigned liability by repaying it with external ether',
  )
  .argument('<address>', 'distributor address', stringToAddress)
  .argument('<ether>', 'amount of ether to rebalance (in ETH)', etherToWei)
  .action(async (address: Address, ether: bigint) => {
    const contract = getStvStrategyPoolContract(address);

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

stvStrategyPoolWrite
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
    const contract = getStvStrategyPoolContract(address);

    const confirmationMessage = `Are you sure you want to request a withdrawal of ${assetsToWithdraw} assets?`;
    const confirm = await confirmOperation(confirmationMessage);
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'requestWithdrawalETH',
      payload: [assetsToWithdraw],
    });
  });

stvStrategyPoolWrite
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
  .argument(
    '<stethSharesToBurn>',
    "the amount of stETH shares to burn to repay user's liabilities (18 decimals)",
    stringToBigInt,
  )
  .argument(
    '<stethSharesToRebalance>',
    'the amount of stETH shares to rebalance (18 decimals)',
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
      stethSharesToBurn: bigint,
      stethSharesToRebalance: bigint,
      { receiver }: { receiver: Address },
    ) => {
      const contract = getStvStrategyPoolContract(address);
      const account = await getAccount();

      const confirmationMessage = `Are you sure you want to request a withdrawal of ${stvToWithdraw} stv to ${receiver}? (stethSharesToBurn: ${stethSharesToBurn}, stethSharesToRebalance: ${stethSharesToRebalance})`;
      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'requestWithdrawal',
        payload: [
          stvToWithdraw,
          stethSharesToBurn,
          stethSharesToRebalance,
          receiver || account.address,
        ],
      });
    },
  );

stvStrategyPoolWrite
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
  .argument(
    '<stethSharesToBurn>',
    "the amount of stETH shares to burn to repay user's liabilities (18 decimals)",
    stringToBigInt,
  )
  .argument(
    '<stethSharesToRebalance>',
    'the amount of stETH shares to rebalance (18 decimals)',
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
      stethSharesToBurn: bigint,
      stethSharesToRebalance: bigint[],
      { receiver }: { receiver: Address },
    ) => {
      const contract = getStvStrategyPoolContract(address);
      const account = await getAccount();

      const confirmationMessage = `Are you sure you want to request multiple withdrawals of ${stvToWithdraw.join(', ')} stv to ${receiver}? (stethSharesToBurn: ${stethSharesToBurn}, stethSharesToRebalance: ${stethSharesToRebalance.join(', ')})`;
      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'requestWithdrawals',
        payload: [
          stvToWithdraw,
          stethSharesToRebalance,
          stethSharesToBurn,
          receiver || account.address,
        ],
      });
    },
  );

stvStrategyPoolWrite
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
      const contract = getStvStrategyPoolContract(address);
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

stvStrategyPoolWrite
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
      const contract = getStvStrategyPoolContract(address);
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

stvStrategyPoolWrite
  .command('burn-stv-for-withdrawal-queue')
  .description(
    'burn stv from WithdrawalQueue contract when processing withdrawal requests',
  )
  .argument('<address>', 'distributor address', stringToAddress)
  .argument('<stv>', 'amount of stv to burn (27 decimals)', stringToBigInt)
  .action(async (address: Address, stv: bigint) => {
    const contract = getStvStrategyPoolContract(address);

    const confirmationMessage = `Are you sure you want to burn ${stv} stv for the withdrawal queue ${address}?`;
    const confirm = await confirmOperation(confirmationMessage);
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'burnStvForWithdrawalQueue',
      payload: [stv],
    });
  });

stvStrategyPoolWrite
  .command('disconnect-vault')
  .description('initiates voluntary vault disconnection from VaultHub')
  .argument('<address>', 'distributor address', stringToAddress)
  .action(async (address: Address) => {
    const contract = getStvStrategyPoolContract(address);

    const confirmationMessage = `Are you sure you want to disconnect the vault ${address}?`;
    const confirm = await confirmOperation(confirmationMessage);
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'disconnectVault',
      payload: [],
    });
  });

stvStrategyPoolWrite
  .command('claim-connect-deposit')
  .description('claims the connect deposit after vault has been disconnected')
  .argument('<address>', 'distributor address', stringToAddress)
  .option(
    '-r, --receiver <receiver>',
    'the address to receive the claimed ether, or address(0)',
    stringToAddress,
  )
  .action(async (address: Address, { receiver }: { receiver: Address }) => {
    const contract = getStvStrategyPoolContract(address);
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

stvStrategyPoolWrite
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
      const contract = getStvStrategyPoolContract(address);

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

stvStrategyPoolWrite
  .command('request-validator-exit')
  .description('requests validator exit')
  .argument('<address>', 'distributor address', stringToAddress)
  .argument('<pubkeys>', 'validator public keys', stringToHexArray)
  .action(async (address: Address, pubkeys: Hex[]) => {
    const contract = getStvStrategyPoolContract(address);

    const confirmationMessage = `Are you sure you want to request validator exit for the vault ${address} with pubkeys ${pubkeys.join(', ')}?`;
    const confirm = await confirmOperation(confirmationMessage);
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'requestValidatorExit',
      payload: [pubkeys.join('') as Hex],
    });
  });

stvStrategyPoolWrite
  .command('add-to-allow-list')
  .description('add an address to the allowlist')
  .argument('<address>', 'distributor address', stringToAddress)
  .argument('<user>', 'address to add to the allowlist', stringToAddress)
  .action(async (address: Address, user: Address) => {
    const contract = getStvStrategyPoolContract(address);

    const confirmationMessage = `Are you sure you want to add ${user} to the allowlist for the vault ${address}?`;
    const confirm = await confirmOperation(confirmationMessage);
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'addToAllowList',
      payload: [user],
    });
  });

stvStrategyPoolWrite
  .command('remove-from-allow-list')
  .description('remove an address from the allowlist')
  .argument('<address>', 'distributor address', stringToAddress)
  .argument('<user>', 'address to remove from the allowlist', stringToAddress)
  .action(async (address: Address, user: Address) => {
    const contract = getStvStrategyPoolContract(address);

    const confirmationMessage = `Are you sure you want to remove ${user} from the allowlist for the vault ${address}?`;
    const confirm = await confirmOperation(confirmationMessage);
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'removeFromAllowList',
      payload: [user],
    });
  });

stvStrategyPoolWrite
  .command('mint-steth-shares')
  .description("mint stETH shares up to the user's minting capacity")
  .argument('<address>', 'distributor address', stringToAddress)
  .argument(
    '<stethShares>',
    'the amount of stETH shares to mint',
    stringToBigInt,
  )
  .action(async (address: Address, stethShares: bigint) => {
    const contract = getStvStrategyPoolContract(address);

    const confirmationMessage = `Are you sure you want to mint stETH shares up to the user's minting capacity for the vault ${address}? (stethShares: ${stethShares})`;
    const confirm = await confirmOperation(confirmationMessage);
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'mintStethShares',
      payload: [stethShares],
    });
  });

stvStrategyPoolWrite
  .command('burn-steth-shares')
  .description("burn stETH shares to reduce the user's minted stETH obligation")
  .argument('<address>', 'distributor address', stringToAddress)
  .argument(
    '<stethShares>',
    'the amount of stETH shares to burn',
    stringToBigInt,
  )
  .action(async (address: Address, stethShares: bigint) => {
    const contract = getStvStrategyPoolContract(address);

    const confirmationMessage = `Are you sure you want to burn stETH shares to reduce the user's minted stETH obligation for the vault ${address}? (stethShares: ${stethShares})`;
    const confirm = await confirmOperation(confirmationMessage);
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'burnStethShares',
      payload: [stethShares],
    });
  });

stvStrategyPoolWrite
  .command('rebalance-minted-steth-shares')
  .description("rebalance the user's minted stETH shares by burning stv")
  .argument('<address>', 'distributor address', stringToAddress)
  .argument(
    '<stethShares>',
    'the amount of stETH shares to rebalance',
    stringToBigInt,
  )
  .argument(
    '<maxStvToBurn>',
    'the maximum amount of stv to burn for rebalancing',
    stringToBigInt,
  )
  .action(
    async (address: Address, stethShares: bigint, maxStvToBurn: bigint) => {
      const contract = getStvStrategyPoolContract(address);

      const confirmationMessage = `Are you sure you want to rebalance the user's minted stETH shares by burning stv for the vault ${address}? (stethShares: ${stethShares}, maxStvToBurn: ${maxStvToBurn})`;
      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'rebalanceMintedStethShares',
        payload: [stethShares, maxStvToBurn],
      });
    },
  );

stvStrategyPoolWrite
  .command('transfer-with-liability')
  .description('transfer stETH shares with liability to another address')
  .argument('<address>', 'distributor address', stringToAddress)
  .argument('<to>', 'the address to transfer to', stringToAddress)
  .argument('<stv>', 'the amount of stv to transfer', stringToBigInt)
  .argument(
    '<stethShares>',
    'the amount of stETH shares liability to transfer',
    stringToBigInt,
  )
  .action(
    async (address: Address, to: Address, stv: bigint, stethShares: bigint) => {
      const contract = getStvStrategyPoolContract(address);

      const confirmationMessage = `Are you sure you want to transfer ${stv} stv and ${stethShares} stETH shares liability to ${to} for the vault ${address}?`;
      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'transferWithLiability',
        payload: [to, stv, stethShares],
      });
    },
  );

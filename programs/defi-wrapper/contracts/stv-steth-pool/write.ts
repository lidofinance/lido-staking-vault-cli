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

import { stvStethPool } from './main.js';
import { Address, formatEther, zeroAddress } from 'viem';
import { getStvStethPoolContract } from 'contracts/defi-wrapper/index.js';

const stvStethPoolWrite = stvStethPool
  .command('write')
  .alias('w')
  .description('write commands');

stvStethPoolWrite.addOption(new Option('-cmd2json'));
stvStethPoolWrite.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(stvStethPoolWrite));
  process.exit();
});

stvStethPoolWrite
  .command('deposit-eth-shares')
  .description(
    'deposit native ETH and receive stv, minting a specific amount of stETH shares',
  )
  .argument('<address>', 'stv steth pool address', stringToAddress)
  .argument('<amount>', 'amount of ETH to deposit (in ETH)', etherToWei)
  .argument(
    '<stethSharesToMint>',
    'amount of stETH shares to mint (in shares)',
    etherToWei,
  )
  .option('-r, --referral <referral>', 'referral address', stringToAddress)
  .action(
    async (
      address: Address,
      amount: bigint,
      stethSharesToMint: bigint,
      { referral }: { referral: Address },
    ) => {
      const contract = await getStvStethPoolContract(address);

      const confirmationMessage = `Are you sure you want to deposit ${formatEther(amount)} ETH to the stv steth pool? (referral: ${referral || zeroAddress}, stethSharesToMint: ${formatEther(stethSharesToMint)})`;
      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'depositETHAndMintStethShares',
        payload: [referral || zeroAddress, stethSharesToMint],
        value: amount,
      });
    },
  );

stvStethPoolWrite
  .command('deposit-eth-wsteth')
  .description(
    'deposit native ETH and receive stv, minting a specific amount of wstETH',
  )
  .argument('<address>', 'stv steth pool address', stringToAddress)
  .argument('<amount>', 'amount of ETH to deposit (in ETH)', etherToWei)
  .argument(
    '<wstethToMint>',
    'amount of wstETH to mint (in wstETH)',
    etherToWei,
  )
  .option('-r, --referral <referral>', 'referral address', stringToAddress)
  .action(
    async (
      address: Address,
      amount: bigint,
      wstethToMint: bigint,
      { referral }: { referral: Address },
    ) => {
      const contract = await getStvStethPoolContract(address);

      const confirmationMessage = `Are you sure you want to deposit ${formatEther(amount)} ETH to the stv steth pool? (referral: ${referral || zeroAddress}, wstethToMint: ${formatEther(wstethToMint)})`;
      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'depositETHAndMintWsteth',
        payload: [referral || zeroAddress, wstethToMint],
        value: amount,
      });
    },
  );

stvStethPoolWrite
  .command('rebalance-unassigned-liability')
  .description(
    'rebalance unassigned liability by repaying it with assets held by the vault',
  )
  .argument('<address>', 'stv steth pool address', stringToAddress)
  .argument(
    '<stethShares>',
    'amount of stETH shares to rebalance (in shares)',
    stringToBigInt,
  )
  .action(async (address: Address, stethShares: bigint) => {
    const contract = await getStvStethPoolContract(address);

    const confirmationMessage = `Are you sure you want to rebalance unassigned liability with ${stethShares} stETH shares?`;
    const confirm = await confirmOperation(confirmationMessage);
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'rebalanceUnassignedLiability',
      payload: [stethShares],
    });
  });

stvStethPoolWrite
  .command('rebalance-unassigned-liability-with-ether')
  .description(
    'rebalance unassigned liability by repaying it with external ether',
  )
  .argument('<address>', 'stv steth pool address', stringToAddress)
  .argument('<ether>', 'amount of ether to rebalance (in ETH)', etherToWei)
  .action(async (address: Address, ether: bigint) => {
    const contract = await getStvStethPoolContract(address);

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

stvStethPoolWrite
  .command('add-to-allow-list')
  .description('add an address to the allowlist')
  .argument('<address>', 'stv steth pool address', stringToAddress)
  .argument('<user>', 'address to add to the allowlist', stringToAddress)
  .action(async (address: Address, user: Address) => {
    const contract = await getStvStethPoolContract(address);

    const confirmationMessage = `Are you sure you want to add ${user} to the allowlist for the vault ${address}?`;
    const confirm = await confirmOperation(confirmationMessage);
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'addToAllowList',
      payload: [user],
    });
  });

stvStethPoolWrite
  .command('remove-from-allow-list')
  .description('remove an address from the allowlist')
  .argument('<address>', 'stv steth pool address', stringToAddress)
  .argument('<user>', 'address to remove from the allowlist', stringToAddress)
  .action(async (address: Address, user: Address) => {
    const contract = await getStvStethPoolContract(address);

    const confirmationMessage = `Are you sure you want to remove ${user} from the allowlist for the vault ${address}?`;
    const confirm = await confirmOperation(confirmationMessage);
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'removeFromAllowList',
      payload: [user],
    });
  });

stvStethPoolWrite
  .command('mint-steth-shares')
  .description("mint stETH shares up to the user's minting capacity")
  .argument('<address>', 'stv steth pool address', stringToAddress)
  .argument(
    '<stethShares>',
    'the amount of stETH shares to mint (in shares)',
    stringToBigInt,
  )
  .action(async (address: Address, stethShares: bigint) => {
    const contract = await getStvStethPoolContract(address);

    const confirmationMessage = `Are you sure you want to mint stETH shares up to the user's minting capacity for the vault ${address}? (stethShares: ${stethShares})`;
    const confirm = await confirmOperation(confirmationMessage);
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'mintStethShares',
      payload: [stethShares],
    });
  });

stvStethPoolWrite
  .command('burn-steth-shares')
  .description("burn stETH shares to reduce the user's minted stETH obligation")
  .argument('<address>', 'stv steth pool address', stringToAddress)
  .argument(
    '<stethShares>',
    'the amount of stETH shares to burn (in shares)',
    stringToBigInt,
  )
  .action(async (address: Address, stethShares: bigint) => {
    const contract = await getStvStethPoolContract(address);

    const confirmationMessage = `Are you sure you want to burn stETH shares to reduce the user's minted stETH obligation for the vault ${address}? (stethShares: ${stethShares})`;
    const confirm = await confirmOperation(confirmationMessage);
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'burnStethShares',
      payload: [stethShares],
    });
  });

stvStethPoolWrite
  .command('pause-minting')
  .description('pause minting of stETH shares')
  .argument('<address>', 'stv steth pool address', stringToAddress)
  .action(async (address: Address) => {
    const contract = await getStvStethPoolContract(address);

    const confirmationMessage = `Are you sure you want to pause minting for the pool ${address}?`;
    const confirm = await confirmOperation(confirmationMessage);
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'pauseMinting',
      payload: [],
    });
  });

stvStethPoolWrite
  .command('resume-minting')
  .description('resume minting of stETH shares')
  .argument('<address>', 'stv steth pool address', stringToAddress)
  .action(async (address: Address) => {
    const contract = await getStvStethPoolContract(address);

    const confirmationMessage = `Are you sure you want to resume minting for the pool ${address}?`;
    const confirm = await confirmOperation(confirmationMessage);
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'resumeMinting',
      payload: [],
    });
  });

stvStethPoolWrite
  .command('transfer-with-liability')
  .description('transfer stETH shares with liability to another address')
  .argument('<address>', 'stv steth pool address', stringToAddress)
  .argument('<to>', 'the address to transfer to', stringToAddress)
  .argument('<stv>', 'the amount of stv to transfer', stringToBigInt)
  .argument(
    '<stethShares>',
    'the amount of stETH shares liability to transfer',
    stringToBigInt,
  )
  .action(
    async (address: Address, to: Address, stv: bigint, stethShares: bigint) => {
      const contract = await getStvStethPoolContract(address);

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

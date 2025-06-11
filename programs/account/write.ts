import { Address, formatEther, parseEther } from 'viem';
import { generatePrivateKey } from 'viem/accounts';
import { Option } from 'commander';
import { Wallet } from '@kaiachain/ethers-ext';

import { getStethContract, getWstethContract } from 'contracts';
import {
  getCommandsJson,
  logInfo,
  callWriteMethodWithReceipt,
  stringToAddress,
  confirmOperation,
} from 'utils';

import { account } from './main.js';

const accountWrite = account
  .command('write')
  .aliases(['w'])
  .description('account write commands');

accountWrite.addOption(new Option('-cmd2json'));
accountWrite.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(accountWrite));
  process.exit();
});

accountWrite
  .command('generate-key')
  .description(
    'generate a new key. Disclaimer: this command is not recommended for production use.',
  )
  .action(async () => {
    const privateKey = generatePrivateKey();
    logInfo(`Private key: ${privateKey}`);
  });

accountWrite
  .command('generate-encrypted-account')
  .description('generate a new encrypted account')
  .argument('<password>', 'password for the encrypted account')
  .action(async (password: string) => {
    const randomPrivateKey = Wallet.createRandom();
    const encrypted = await randomPrivateKey.encrypt(password);

    logInfo(`Encrypted account: ${encrypted}`);
  });

accountWrite
  .command('steth-allowance')
  .description('set allowance for steth contract')
  .argument('<address>', 'address to set allowance for', stringToAddress)
  .argument('<amount>', 'amount of steth to allow (in stETH)')
  .action(async (address: Address, amount: string) => {
    const stethContract = await getStethContract();

    const confirm = await confirmOperation(
      `Are you sure you want to set allowance ${formatEther(
        parseEther(amount),
      )} for ${address}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract: stethContract,
      methodName: 'approve',
      payload: [address, parseEther(amount)],
    });
  });

accountWrite
  .command('wsteth-allowance')
  .description('set allowance for wsteth contract')
  .argument('<address>', 'address to set allowance for', stringToAddress)
  .argument('<amount>', 'amount of wsteth to allow')
  .action(async (address: Address, amount: string) => {
    const wstethContract = await getWstethContract();

    const confirm = await confirmOperation(
      `Are you sure you want to set allowance ${formatEther(
        parseEther(amount),
      )} for ${address}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract: wstethContract,
      methodName: 'approve',
      payload: [address, parseEther(amount)],
    });
  });

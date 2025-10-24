import { Address, formatEther } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { Option } from 'commander';
import { Keystore } from 'ox';

import { getStethContract, getWstethContract } from 'contracts';
import {
  getCommandsJson,
  logInfo,
  callWriteMethodWithReceipt,
  stringToAddress,
  confirmOperation,
  etherToWei,
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
    const randomPrivateKey = generatePrivateKey();
    const account = privateKeyToAccount(randomPrivateKey);
    const [key, opts] = Keystore.scrypt({
      password,
    });
    const encrypted = Keystore.encrypt(randomPrivateKey, key, opts);
    const encryptedWithAddress = {
      address: account.address,
      ...encrypted,
    };

    logInfo(`Encrypted account: ${JSON.stringify(encryptedWithAddress)}`);
  });

accountWrite
  .command('steth-allowance')
  .description('set allowance for steth contract')
  .argument('<address>', 'address to set allowance for', stringToAddress)
  .argument('<amount>', 'amount of steth to allow (in stETH)', etherToWei)
  .action(async (address: Address, amount: bigint) => {
    const stethContract = await getStethContract();

    const confirm = await confirmOperation(
      `Are you sure you want to set allowance ${formatEther(amount)} stETH for ${address}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract: stethContract,
      methodName: 'approve',
      payload: [address, amount],
    });
  });

accountWrite
  .command('wsteth-allowance')
  .description('set allowance for wsteth contract')
  .argument('<address>', 'address to set allowance for', stringToAddress)
  .argument('<amount>', 'amount of wsteth to allow (in wstETH)', etherToWei)
  .action(async (address: Address, amount: bigint) => {
    const wstethContract = await getWstethContract();

    const confirm = await confirmOperation(
      `Are you sure you want to set allowance ${formatEther(amount)} wstETH for ${address}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract: wstethContract,
      methodName: 'approve',
      payload: [address, amount],
    });
  });

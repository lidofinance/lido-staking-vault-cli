import { Address, encodeFunctionData, formatEther, parseEther } from 'viem';
import { generatePrivateKey } from 'viem/accounts';
import { program } from 'command';
import { Option } from 'commander';
import { Wallet } from '@kaiachain/ethers-ext';

import { getStethContract, getWstethContract } from 'contracts';
import { getWalletWithAccount, getPublicClient, getAccount } from 'providers';
import {
  printError,
  showSpinner,
  logResult,
  getCommandsJson,
  logInfo,
  callWriteMethodWithReceipt,
  stringToAddress,
  confirmOperation,
  callReadMethod,
} from 'utils';

const account = program
  .command('account')
  .description('connected account info');

account.addOption(new Option('-cmd2json'));
account.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(account));
  process.exit();
});

account
  .command('info')
  .description('general account info.')
  .action(async () => {
    const walletClient = getWalletWithAccount();
    const publicClient = getPublicClient();
    const address = walletClient.account?.address;

    if (!address) {
      printError(
        new Error('No account address found'),
        'No account address found',
      );
      return;
    }

    try {
      const stETHContract = await getStethContract();
      const wstETHContract = await getWstethContract();
      const hideSpinner = showSpinner();
      const balance = await publicClient.getBalance({ address });
      const stETHBalance = await stETHContract.read.balanceOf([address]);
      const wstETHBalance = await wstETHContract.read.balanceOf([address]);
      hideSpinner();

      logResult({
        address,
        balanceWEI: balance,
        balanceETH: formatEther(balance),
        balanceSTETH: formatEther(stETHBalance),
        balanceWSTETH: formatEther(wstETHBalance),
      });
    } catch (err) {
      printError(err, 'Error when getting account info');
    }
  });

account
  .command('generate-key')
  .description(
    'generate a new key. Disclaimer: this command is not recommended for production use.',
  )
  .action(async () => {
    const privateKey = generatePrivateKey();
    logInfo(`Private key: ${privateKey}`);
  });

account
  .command('generate-encrypted-account')
  .description('generate a new encrypted account')
  .argument('<password>', 'password for the encrypted account')
  .action(async (password: string) => {
    const randomPrivateKey = Wallet.createRandom();
    const encrypted = await randomPrivateKey.encrypt(password);

    logInfo(`Encrypted account: ${encrypted}`);
  });

account
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

account
  .command('steth-allowance-populate-tx')
  .alias('steth-allowance-tx')
  .description('populate tx for steth allowance')
  .argument('<address>', 'address to set allowance for', stringToAddress)
  .argument('<amount>', 'amount of steth to allow')
  .action(async (address: Address, amount: string) => {
    const stethContract = await getStethContract();

    const tx = encodeFunctionData({
      abi: stethContract.abi,
      functionName: 'approve',
      args: [address, parseEther(amount)],
    });

    logInfo(tx);
  });

account
  .command('get-steth-allowance')
  .description('get steth allowance for an address')
  .argument('<address>', 'address to get allowance for', stringToAddress)
  .action(async (address: Address) => {
    const accountAddress = getAccount().address;
    const stethContract = await getStethContract();

    await callReadMethod(stethContract, 'allowance', [accountAddress, address]);
  });

account
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

account
  .command('wsteth-allowance-populate-tx')
  .alias('wsteth-allowance-tx')
  .description('populate tx for wsteth allowance')
  .argument('<address>', 'address to set allowance for', stringToAddress)
  .argument('<amount>', 'amount of wsteth to allow (in wstETH)')
  .action(async (address: Address, amount: string) => {
    const wstethContract = await getWstethContract();

    const tx = encodeFunctionData({
      abi: wstethContract.abi,
      functionName: 'approve',
      args: [address, parseEther(amount)],
    });

    logInfo(tx);
  });

account
  .command('get-wsteth-allowance')
  .description('get wsteth allowance for an address')
  .argument('<address>', 'address to get allowance for', stringToAddress)
  .action(async (address: Address) => {
    const accountAddress = getAccount().address;
    const wstethContract = await getWstethContract();

    await callReadMethod(wstethContract, 'allowance', [
      accountAddress,
      address,
    ]);
  });

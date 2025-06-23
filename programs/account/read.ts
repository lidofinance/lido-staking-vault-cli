import { Option } from 'commander';
import { Address, encodeFunctionData, formatEther, parseEther } from 'viem';

import { getStethContract, getWstethContract } from 'contracts';
import { getWalletWithAccount, getPublicClient, getAccount } from 'providers';
import {
  printError,
  showSpinner,
  logResult,
  getCommandsJson,
  logInfo,
  stringToAddress,
  callReadMethod,
} from 'utils';

import { account } from './main.js';

const accountRead = account
  .command('read')
  .aliases(['r'])
  .description('report read commands');

accountRead.addOption(new Option('-cmd2json'));
accountRead.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(accountRead));
  process.exit();
});

accountRead
  .command('info')
  .description('general account info.')
  .argument('[address]', 'wallet address to check (optional)', stringToAddress)
  .action(async (providedAddress?: Address) => {
    const publicClient = getPublicClient();
    let address: Address;

    if (providedAddress) {
      // Use provided address
      address = providedAddress;
    } else {
      // Use wallet address from config
      const walletClient = getWalletWithAccount();
      const walletAddress = walletClient.account?.address;

      if (!walletAddress) {
        printError(
          new Error('No account address found'),
          'No account address found. Please provide an address as argument or configure PRIVATE_KEY.',
        );
        return;
      }
      address = walletAddress;
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
        data: [
          ['Address', address],
          ['Balance (ETH)', formatEther(balance)],
          ['Balance (STETH)', formatEther(stETHBalance)],
          ['Balance (WSTETH)', formatEther(wstETHBalance)],
        ],
      });
    } catch (err) {
      printError(err, 'Error when getting account info');
    }
  });

accountRead
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

    logInfo({
      to: address,
      value: parseEther(amount),
      data: tx,
    });
  });

accountRead
  .command('get-steth-allowance')
  .description('get steth allowance for an address')
  .argument('<address>', 'address to get allowance for', stringToAddress)
  .action(async (address: Address) => {
    const accountAddress = getAccount().address;
    const stethContract = await getStethContract();

    await callReadMethod(stethContract, 'allowance', [accountAddress, address]);
  });

accountRead
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

accountRead
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

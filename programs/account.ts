import { formatEther } from 'viem';
import { generatePrivateKey } from 'viem/accounts';
import { program } from 'command';
import { Option } from 'commander';

import { getStethContract } from 'contracts';
import { getWalletWithAccount, getPublicClient } from 'providers';
import {
  printError,
  showSpinner,
  logResult,
  getCommandsJson,
  logInfo,
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
    const { address } = walletClient.account;

    try {
      const stETHContract = await getStethContract();
      const hideSpinner = showSpinner();
      const balance = await publicClient.getBalance({ address });
      const stETHBalance = await stETHContract.read.balanceOf([address]);
      hideSpinner();

      logResult({
        address,
        balanceWEI: balance,
        balanceETH: formatEther(balance),
        balanceSTETH: formatEther(stETHBalance),
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

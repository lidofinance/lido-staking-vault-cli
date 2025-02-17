import { formatEther } from 'viem';
import { program } from 'command';
import { getWalletWithAccount, getPublicClient } from 'providers/index.js';
import { printError } from 'utils/index.js';

const account = program
  .command('account')
  .description('connected account info');

account
  .command('info')
  .description('general account info')
  .action(async () => {
    const walletClient = getWalletWithAccount();
    const publicClient = getPublicClient();
    const { address } = walletClient.account;

    try {
      const balance = await publicClient.getBalance({ address });

      console.table({
        address,
        balanceWEI: balance,
        balanceETH: formatEther(balance),
      });
    } catch (err) {
      printError(err, 'Error when getting account info');
    }
  });

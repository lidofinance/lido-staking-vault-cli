import { Option } from 'commander';
import { Address, erc20Abi, formatUnits, getContract, parseUnits } from 'viem';
import {
  logInfo,
  getCommandsJson,
  stringToAddress,
  callWriteMethodWithReceipt,
  confirmOperation,
} from 'utils';
import { getGenericStrategyContract } from 'contracts/defi-wrapper/generic-strategy.js';
import { strategy } from './main.js';
import { getPublicClient } from 'providers';

const strategyWrite = strategy
  .command('write')
  .alias('w')
  .description('write commands');

strategyWrite.addOption(new Option('-cmd2json'));
strategyWrite.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(strategyWrite));
  process.exit();
});

strategyWrite
  .command('safe-transfer-erc20')
  .description('transfer ERC20 tokens from strategy proxy to a recipient')
  .argument('<address>', 'strategy address', stringToAddress)
  .argument('<token>', 'ERC20 token address', stringToAddress)
  .argument('<recipient>', 'recipient address', stringToAddress)
  .argument('<amount>', 'amount of tokens to transfer (in human-readable units)')
  .action(
    async (
      address: Address,
      token: Address,
      recipient: Address,
      amountStr: string,
    ) => {
      const contract = await getGenericStrategyContract(address);
      const publicClient = await getPublicClient();

      const tokenContract = getContract({
        address: token,
        abi: erc20Abi,
        client: publicClient,
      });

      let decimals = 18;
      let symbol = 'UNKNOWN';
      try {
        [decimals, symbol] = await Promise.all([
          tokenContract.read.decimals(),
          tokenContract.read.symbol(),
        ]);
      } catch {
        logInfo(
          `Could not read token metadata (decimals/symbol) for ${token}. Defaulting to 18 decimals.`,
        );
      }

      const amount = parseUnits(amountStr, decimals);

      const confirmationMessage = `Are you sure you want to transfer ${formatUnits(amount, decimals)} ${symbol} (${decimals} decimals) from strategy proxy ${address}?\n  Token: ${token}\n  Recipient: ${recipient}`;
      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'safeTransferERC20',
        payload: [token, recipient, amount],
      });
    },
  );

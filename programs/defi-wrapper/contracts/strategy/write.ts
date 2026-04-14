import { Option } from 'commander';
import { Address, formatEther } from 'viem';
import {
  logInfo,
  getCommandsJson,
  stringToAddress,
  callWriteMethodWithReceipt,
  confirmOperation,
  etherToWei,
} from 'utils';
import { getGenericStrategyContract } from 'contracts/defi-wrapper/generic-strategy.js';
import { strategy } from './main.js';

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
  .argument('<address>', 'strategy proxy address', stringToAddress)
  .argument('<token>', 'ERC20 token address', stringToAddress)
  .argument('<recipient>', 'recipient address', stringToAddress)
  .argument('<amount>', 'amount of tokens to transfer (in ETH)', etherToWei)
  .action(
    async (
      address: Address,
      token: Address,
      recipient: Address,
      amount: bigint,
    ) => {
      const contract = await getGenericStrategyContract(address);

      const confirmationMessage = `Are you sure you want to transfer tokens from strategy proxy ${address}? (token: ${token}, recipient: ${recipient}, amount: ${formatEther(amount)})`;
      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'safeTransferERC20',
        payload: [token, recipient, amount],
      });
    },
  );

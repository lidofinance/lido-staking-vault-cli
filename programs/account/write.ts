import { Address, formatEther, Hex } from 'viem';
import { mainnet } from 'viem/chains';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { Option, program } from 'commander';
import { Keystore } from 'ox';

import { getStethContract, getWstethContract } from 'contracts';
import { getChain } from 'configs';
import {
  getCommandsJson,
  logInfo,
  callWriteMethodWithReceipt,
  stringToAddress,
  confirmOperation,
  etherToWei,
  stringToHex,
  stringToBigInt,
  callWCWriteMethodWithReceipt,
  callWriteMethod,
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
    const chainId = (await getChain()).id;

    const isMainnet = chainId === mainnet.id;
    if (isMainnet) {
      logInfo('⚠️⚠️ This command is not recommended for production use. ⚠️⚠️');
      return;
    }

    const privateKey = generatePrivateKey();
    // Write to stderr so pipes/redirects cannot capture the key
    process.stderr.write(`Private key: ${privateKey}\n`);
  });

accountWrite
  .command('generate-encrypted-account')
  .description('generate a new encrypted account')
  .argument('<password>', 'password for the encrypted account')
  .action(async (password: string) => {
    const chainId = (await getChain()).id;

    const isMainnet = chainId === mainnet.id;
    if (isMainnet) {
      logInfo('⚠️⚠️ This command is not recommended for production use. ⚠️⚠️');
      return;
    }

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

accountWrite
  .command('send-tx')
  .description('sends populated transaction')
  .option(
    '-t, --to [toAddress]',
    'Address to send transaction to',
    stringToAddress,
  )
  .option(
    '-d, --data [data]',
    'Data to use for transaction, default no data',
    stringToHex,
    '0x',
  )
  .option(
    '-v, --value [valueWei]',
    'ETH value in wei to send with transaction',
    stringToBigInt,
    0n,
  )
  .action(
    async ({ to, data, value }: { to: Address; data: Hex; value: bigint }) => {
      if (program.opts().walletConnect) {
        await callWCWriteMethodWithReceipt({
          calls: [
            {
              data,
              to,
              value,
            },
          ],
          withSpinner: true,
        });

        return;
      }

      await callWriteMethod({
        contract: { address: to, abi: [] } as any,
        methodName: data,
        value,
        payload: [],
      });
    },
  );

import { type Address, formatEther } from 'viem';
import { Option } from 'commander';

import {
  logInfo,
  getCommandsJson,
  etherToWei,
  stringToAddress,
  confirmOperation,
  callWriteMethodWithReceipt,
} from 'utils';
import {
  chooseVaultAndGetDashboard,
  getRecipient,
  mintShares,
  checkIsReportFresh,
  mintSteth,
  burnShares,
  burnSteth,
} from 'features';

import { vaultOperations } from './main.js';

// TODO: add check roles for operations

export const vaultOperationsWrite = vaultOperations
  .command('write')
  .aliases(['w'])
  .description('vault operations write commands');

vaultOperationsWrite.addOption(new Option('-cmd2json'));
vaultOperationsWrite.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(vaultOperationsWrite));
  process.exit();
});

vaultOperationsWrite
  .command('fund')
  .description('fund vaults')
  .argument('<ether>', 'amount of ether to be funded (in ETH)', etherToWei)
  .option('-v, --vault <string>', 'vault address', stringToAddress)
  .action(async (ether: bigint, { vault }: { vault: Address }) => {
    const { contract, vault: vaultAddress } =
      await chooseVaultAndGetDashboard(vault);

    const confirm = await confirmOperation(
      `Are you sure you want to fund the staking vault ${vaultAddress} with ${formatEther(ether)} ether?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'fund',
      payload: [],
      value: ether,
    });
  });

vaultOperationsWrite
  .command('withdraw')
  .description('withdraws ether from the staking vault to a recipient')
  .argument('<eth>', 'amount of ether to withdraw (in ETH)', etherToWei)
  .option(
    '-r, --recipient <string>',
    'address of the recipient',
    stringToAddress,
  )
  .option('-v, --vault <string>', 'vault address', stringToAddress)
  .action(
    async (
      ether: bigint,
      { vault, recipient }: { vault: Address; recipient: Address },
    ) => {
      const recipientAddress = await getRecipient(recipient);
      const { contract, vault: vaultAddress } =
        await chooseVaultAndGetDashboard(vault);

      const confirm = await confirmOperation(
        `Are you sure you want to withdraw ${formatEther(ether)} from the staking vault ${vaultAddress} to ${recipientAddress}?`,
      );
      if (!confirm) return;

      const isReportFresh = await checkIsReportFresh(vaultAddress);
      if (!isReportFresh) return;

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'withdraw',
        payload: [recipientAddress, ether],
      });
    },
  );

// Mint commands

vaultOperationsWrite
  .command('mint-shares')
  .alias('mint')
  .description('mints stETH tokens backed by the vault to a recipient')
  .argument(
    '<amountOfShares>',
    'amount of shares to mint (in Shares)',
    etherToWei,
  )
  .option(
    '-r, --recipient <string>',
    'address of the recipient',
    stringToAddress,
  )
  .option('-v, --vault <string>', 'vault address', stringToAddress)
  .action(
    async (
      amountOfShares: bigint,
      { vault, recipient }: { vault: Address; recipient: Address },
    ) => {
      const recipientAddress = await getRecipient(recipient);
      const { contract, vault: vaultAddress } =
        await chooseVaultAndGetDashboard(vault);

      const confirm = await confirmOperation(
        `Are you sure you want to mint ${formatEther(amountOfShares)} shares to ${recipientAddress} in the staking vault ${vaultAddress}?`,
      );
      if (!confirm) return;

      await mintShares(
        contract,
        recipientAddress,
        amountOfShares,
        vaultAddress,
        'mintShares',
      );
    },
  );

vaultOperationsWrite
  .command('mint-wsteth')
  .description('mints wstETH tokens backed by the vault to a recipient')
  .argument('<amountOfWsteth>', 'amount of wstETH to mint', etherToWei)
  .option(
    '-r, --recipient <string>',
    'address of the recipient',
    stringToAddress,
  )
  .option('-v, --vault <string>', 'vault address', stringToAddress)
  .action(
    async (
      amountOfWsteth: bigint,
      { vault, recipient }: { vault: Address; recipient: Address },
    ) => {
      const recipientAddress = await getRecipient(recipient);
      const { contract, vault: vaultAddress } =
        await chooseVaultAndGetDashboard(vault);

      await mintShares(
        contract,
        recipientAddress,
        amountOfWsteth,
        vaultAddress,
        'mintWstETH',
      );
    },
  );

vaultOperationsWrite
  .command('mint-steth')
  .description('mints stETH tokens backed by the vault to a recipient')
  .argument('<amountOfSteth>', 'amount of stETH to mint', etherToWei)
  .option(
    '-r, --recipient <string>',
    'address of the recipient',
    stringToAddress,
  )
  .option('-v, --vault <string>', 'vault address', stringToAddress)
  .action(
    async (
      amountOfSteth: bigint,
      { vault, recipient }: { vault: Address; recipient: Address },
    ) => {
      const recipientAddress = await getRecipient(recipient);
      const { contract, vault: vaultAddress } =
        await chooseVaultAndGetDashboard(vault);

      await mintSteth(contract, recipientAddress, amountOfSteth, vaultAddress);
    },
  );

// Burn commands

vaultOperationsWrite
  .command('burn-shares')
  .alias('burn')
  .description(
    'Burns stETH shares from the sender backed by the vault. Expects corresponding amount of stETH approved to this contract',
  )
  .option('-v, --vault <string>', 'vault address', stringToAddress)
  .argument(
    '<amountOfShares>',
    'amount of shares to burn (in Shares)',
    etherToWei,
  )
  .action(async (amountOfShares: bigint, { vault }: { vault: Address }) => {
    const { contract, vault: vaultAddress } =
      await chooseVaultAndGetDashboard(vault);

    await burnShares(contract, amountOfShares, vaultAddress, 'burnShares');
  });

vaultOperationsWrite
  .command('burn-steth')
  .description(
    'Burns stETH shares from the sender backed by the vault. Expects stETH amount approved to this contract.',
  )
  .argument(
    '<amountOfShares>',
    'amount of shares to burn (in stETH)',
    etherToWei,
  )
  .option('-v, --vault <string>', 'vault address', stringToAddress)
  .action(async (amountOfShares: bigint, { vault }: { vault: Address }) => {
    const { contract, vault: vaultAddress } =
      await chooseVaultAndGetDashboard(vault);

    await burnSteth(contract, amountOfShares, vaultAddress);
  });

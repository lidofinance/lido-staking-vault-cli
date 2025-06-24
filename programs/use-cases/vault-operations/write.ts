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
  getAddress,
  mintShares,
  checkIsReportFresh,
  mintSteth,
  burnShares,
  burnSteth,
  checkVaultRole,
  checkAllowance,
} from 'features';
import { getAccount } from 'providers';

import { vaultOperations } from './main.js';

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

    const account = getAccount();
    await checkVaultRole(contract, 'FUND_ROLE', account.address);

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
      const recipientAddress = await getAddress(recipient, 'recipient');
      const { contract, vault: vaultAddress } =
        await chooseVaultAndGetDashboard(vault);

      const account = getAccount();
      await checkVaultRole(contract, 'WITHDRAW_ROLE', account.address);

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
      const recipientAddress = await getAddress(recipient, 'recipient');
      const { contract, vault: vaultAddress } =
        await chooseVaultAndGetDashboard(vault);

      const account = getAccount();
      await checkVaultRole(contract, 'MINT_ROLE', account.address);

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
      const recipientAddress = await getAddress(recipient, 'recipient');
      const { contract, vault: vaultAddress } =
        await chooseVaultAndGetDashboard(vault);

      const account = getAccount();
      await checkVaultRole(contract, 'MINT_ROLE', account.address);

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
      const recipientAddress = await getAddress(recipient, 'recipient');
      const { contract, vault: vaultAddress } =
        await chooseVaultAndGetDashboard(vault);

      const account = getAccount();
      await checkVaultRole(contract, 'MINT_ROLE', account.address);

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

    const account = getAccount();
    await checkVaultRole(contract, 'BURN_ROLE', account.address);
    await checkAllowance(contract, amountOfShares, 'shares');

    await burnShares(contract, amountOfShares, vaultAddress, 'burnShares');
  });

vaultOperationsWrite
  .command('burn-steth')
  .description(
    'Burns stETH shares from the sender backed by the vault. Expects stETH amount approved to this contract.',
  )
  .argument('<amountOfSteth>', 'amount of stETH to burn (in stETH)', etherToWei)
  .option('-v, --vault <string>', 'vault address', stringToAddress)
  .action(async (amountOfSteth: bigint, { vault }: { vault: Address }) => {
    const { contract, vault: vaultAddress } =
      await chooseVaultAndGetDashboard(vault);

    const account = getAccount();
    await checkVaultRole(contract, 'BURN_ROLE', account.address);
    await checkAllowance(contract, amountOfSteth, 'steth');

    await burnSteth(contract, amountOfSteth, vaultAddress);
  });

vaultOperationsWrite
  .command('burn-wsteth')
  .description('burn wstETH tokens from the sender backed by the vault')
  .argument(
    '<amountOfWsteth>',
    'amount of wstETH tokens to burn (in wstETH)',
    etherToWei,
  )
  .option('-v, --vault <string>', 'vault address', stringToAddress)
  .action(async (amountOfWsteth: bigint, { vault }: { vault: Address }) => {
    const { contract, vault: vaultAddress } =
      await chooseVaultAndGetDashboard(vault);

    const account = getAccount();
    await checkVaultRole(contract, 'BURN_ROLE', account.address);
    await checkAllowance(contract, amountOfWsteth, 'wsteth');

    await burnShares(contract, amountOfWsteth, vaultAddress, 'burnWstETH');
  });

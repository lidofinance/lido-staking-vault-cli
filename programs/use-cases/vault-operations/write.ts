import { type Address, formatEther } from 'viem';
import { Option } from 'commander';

import {
  logInfo,
  getCommandsJson,
  etherToWei,
  stringToAddress,
  confirmOperation,
  callWriteMethodWithReceipt,
  callReadMethodSilent,
  logError,
  stringToBigInt,
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
  confirmQuarantine,
} from 'features';
import { getAccount } from 'providers';

import { vaultOperations } from './main.js';
import { getOperatorGridContract } from 'contracts';

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
    const { contract, vault: vaultAddress } = await chooseVaultAndGetDashboard({
      vault,
    });

    const quarantineConfirm = await confirmQuarantine(vaultAddress);
    if (!quarantineConfirm) return;

    const account = await getAccount();
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
        await chooseVaultAndGetDashboard({ vault });

      const quarantineConfirm = await confirmQuarantine(vaultAddress);
      if (!quarantineConfirm) return;

      const account = await getAccount();
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
        await chooseVaultAndGetDashboard({ vault });

      const quarantineConfirm = await confirmQuarantine(vaultAddress);
      if (!quarantineConfirm) return;

      const account = await getAccount();
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
        await chooseVaultAndGetDashboard({ vault });

      const quarantineConfirm = await confirmQuarantine(vaultAddress);
      if (!quarantineConfirm) return;

      const account = await getAccount();
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
        await chooseVaultAndGetDashboard({ vault });

      const quarantineConfirm = await confirmQuarantine(vaultAddress);
      if (!quarantineConfirm) return;

      const account = await getAccount();
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
    const { contract, vault: vaultAddress } = await chooseVaultAndGetDashboard({
      vault,
    });

    const quarantineConfirm = await confirmQuarantine(vaultAddress);
    if (!quarantineConfirm) return;

    const account = await getAccount();
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
    const { contract, vault: vaultAddress } = await chooseVaultAndGetDashboard({
      vault,
    });

    const quarantineConfirm = await confirmQuarantine(vaultAddress);
    if (!quarantineConfirm) return;

    const account = await getAccount();
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
    const { contract, vault: vaultAddress } = await chooseVaultAndGetDashboard({
      vault,
    });

    const quarantineConfirm = await confirmQuarantine(vaultAddress);
    if (!quarantineConfirm) return;

    const account = await getAccount();
    await checkVaultRole(contract, 'BURN_ROLE', account.address);
    await checkAllowance(contract, amountOfWsteth, 'wsteth');

    await burnShares(contract, amountOfWsteth, vaultAddress, 'burnWstETH');
  });

vaultOperationsWrite
  .command('disburse-node-operator-fee')
  .description(
    'transfers the node-operator`s accrued fee (if any) to nodeOperatorFeeRecipient',
  )
  .option('-v, --vault <string>', 'vault address', stringToAddress)
  .action(async ({ vault }: { vault: Address }) => {
    const { contract, vault: vaultAddress } = await chooseVaultAndGetDashboard({
      vault,
    });

    const quarantineConfirm = await confirmQuarantine(vaultAddress);
    if (!quarantineConfirm) return;

    const nodeOperatorFeeRecipient = await callReadMethodSilent(
      contract,
      'nodeOperatorFeeRecipient',
    );
    const nodeOperatorDisbursableFee = await callReadMethodSilent(
      contract,
      'nodeOperatorDisbursableFee',
    );

    if (nodeOperatorDisbursableFee === 0n) {
      logError('The node operator has no disbursable fee');
      return;
    }

    const confirm = await confirmOperation(
      `Are you sure you want to transfer the node operator fee to ${nodeOperatorFeeRecipient} (nodeOperatorFeeRecipient) from the staking vault ${vaultAddress}? The node operator disbursable fee is ${formatEther(nodeOperatorDisbursableFee)} ETH`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'disburseNodeOperatorFee',
      payload: [],
    });
  });

vaultOperationsWrite
  .command('set-node-operator-fee-recipient')
  .alias('set-no-f-r')
  .description('sets the node operator fee recipient')
  .option(
    '-rec, --recipient <string>',
    'address of the new node operator fee recipient',
    stringToAddress,
  )
  .option('-v, --vault <string>', 'vault address', stringToAddress)
  .action(
    async ({ vault, recipient }: { vault: Address; recipient: Address }) => {
      const { contract, vault: vaultAddress } =
        await chooseVaultAndGetDashboard({
          vault,
        });

      const account = await getAccount();
      await checkVaultRole(
        contract,
        'NODE_OPERATOR_MANAGER_ROLE',
        account.address,
      );

      const recipientAddress = await getAddress(recipient, 'recipient');

      const confirm = await confirmOperation(
        `Are you sure you want to set the node operator fee recipient to ${recipientAddress} for the vault ${vaultAddress}?`,
      );
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'setNodeOperatorFeeRecipient',
        payload: [recipientAddress],
      });
    },
  );

vaultOperationsWrite
  .command('change-tier-by-no')
  .alias('ct-no')
  .description(
    'vault tier change by node operator with multi-role confirmation',
  )
  .argument('<tierId>', 'tier id', stringToBigInt)
  .option(
    '-r, --requestedShareLimit <string>',
    'requested share limit (in shares)',
    etherToWei,
  )
  .option('-v, --vault <string>', 'vault address', stringToAddress)
  .action(
    async (
      tierId: bigint,
      {
        requestedShareLimit,
        vault,
      }: { requestedShareLimit: bigint; vault: Address },
    ) => {
      const { vault: vaultAddress, vaultContract } =
        await chooseVaultAndGetDashboard({
          vault,
        });
      const operatorGridContract = await getOperatorGridContract();

      const vaultNodeOperator = await callReadMethodSilent(
        vaultContract,
        'nodeOperator',
      );
      const tierInfo = await callReadMethodSilent(
        operatorGridContract,
        'tier',
        [tierId],
      );
      const tierShareLimit = tierInfo.shareLimit;
      let currentShareLimit = tierShareLimit;

      if (requestedShareLimit) {
        const confirmShareLimit = await confirmOperation(
          `Are you sure you want to request change share limit for vault ${vaultAddress} to ${formatEther(requestedShareLimit)} shares (requested tier share limit is ${formatEther(tierShareLimit)} shares)?`,
        );
        if (!confirmShareLimit) return;

        currentShareLimit = requestedShareLimit;
      }

      const confirm = await confirmOperation(
        `Are you sure you want to change the current tier to tier ID ${tierId} for vault ${vaultAddress} with share limit ${formatEther(currentShareLimit)} shares?`,
      );
      if (!confirm) return;

      const account = await getAccount();
      if (account.address !== vaultNodeOperator) {
        throw new Error(
          `You are not the node operator of the vault ${vaultAddress}`,
        );
      }

      await callWriteMethodWithReceipt({
        contract: operatorGridContract,
        methodName: 'changeTier',
        payload: [vaultAddress, tierId, currentShareLimit],
      });
    },
  );

vaultOperationsWrite
  .command('change-tier')
  .alias('ct')
  .description('vault tier change with multi-role confirmation')
  .argument('<tierId>', 'tier id', stringToBigInt)
  .option(
    '-r, --requestedShareLimit <string>',
    'requested share limit (in shares)',
    etherToWei,
  )
  .option('-v, --vault <string>', 'vault address', stringToAddress)
  .action(
    async (
      tierId: bigint,
      {
        requestedShareLimit,
        vault,
      }: { requestedShareLimit: bigint; vault: Address },
    ) => {
      const { contract, vault: vaultAddress } =
        await chooseVaultAndGetDashboard({
          vault,
        });
      const operatorGridContract = await getOperatorGridContract();
      const tierInfo = await callReadMethodSilent(
        operatorGridContract,
        'tier',
        [tierId],
      );
      const tierShareLimit = tierInfo.shareLimit;

      let currentShareLimit = tierShareLimit;
      if (requestedShareLimit) {
        const confirmShareLimit = await confirmOperation(
          `Are you sure you want to request change share limit for vault ${vaultAddress} to ${formatEther(requestedShareLimit)} shares (requested tier share limit is ${formatEther(tierShareLimit)} shares)?`,
        );
        if (!confirmShareLimit) return;

        currentShareLimit = requestedShareLimit;
      }

      const confirm = await confirmOperation(
        `Are you sure you want to change the current tier to tier ID ${tierId} for vault ${vaultAddress} with share limit ${formatEther(currentShareLimit)} shares?`,
      );
      if (!confirm) return;

      const account = await getAccount();
      await checkVaultRole(contract, 'CHANGE_TIER_ROLE', account.address);

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'changeTier',
        payload: [tierId, currentShareLimit],
      });
    },
  );

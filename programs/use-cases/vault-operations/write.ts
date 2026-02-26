import { type Address, formatEther, parseEther } from 'viem';
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
  jsonToRoleAssignment,
  isPopulatedTx,
} from 'utils';
import {
  chooseVaultAndGetDashboard,
  getAddress,
  mintShares,
  mintSteth,
  burnShares,
  burnSteth,
  checkVaultRole,
  checkAllowance,
  confirmQuarantine,
  logRolesOperations,
  askRoleOperationInfo,
  callWriteMethodsWithReportFresh,
  checkVaultAvailableBalance,
  checkIsReportFreshThrowError,
  resolveStethShareLimit,
} from 'features';
import { getAccount } from 'providers';
import { getOperatorGridContract } from 'contracts';
import { RoleAssignment } from 'types';

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

      await callWriteMethodsWithReportFresh({
        vault: vaultAddress,
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
    const allowanceCall = await checkAllowance(
      contract,
      amountOfShares,
      'shares',
      true,
    );

    await burnShares(
      contract,
      amountOfShares,
      vaultAddress,
      'burnShares',
      isPopulatedTx(allowanceCall?.data) ? allowanceCall.data : undefined,
    );
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
    const allowanceCall = await checkAllowance(
      contract,
      amountOfSteth,
      'steth',
      true,
    );

    await burnSteth(
      contract,
      amountOfSteth,
      vaultAddress,
      isPopulatedTx(allowanceCall?.data) ? allowanceCall.data : undefined,
    );
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
    const allowanceCall = await checkAllowance(
      contract,
      amountOfWsteth,
      'wsteth',
      true,
    );

    await burnShares(
      contract,
      amountOfWsteth,
      vaultAddress,
      'burnWstETH',
      isPopulatedTx(allowanceCall?.data) ? allowanceCall.data : undefined,
    );
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

    await checkIsReportFreshThrowError({ vault: vaultAddress });

    const nodeOperatorFeeRecipient = await callReadMethodSilent({
      contract,
      methodName: 'feeRecipient',
      payload: [],
    });
    const nodeOperatorAccruedFee = await callReadMethodSilent({
      contract,
      methodName: 'accruedFee',
      payload: [],
    });

    if (nodeOperatorAccruedFee === 0n) {
      logError('The node operator has no accrued fee');
      return;
    }

    const confirm = await confirmOperation(
      `Are you sure you want to transfer the node operator fee to ${nodeOperatorFeeRecipient} (nodeOperatorFeeRecipient) from the staking vault ${vaultAddress}? The node operator accrued fee is ${formatEther(nodeOperatorAccruedFee)} ETH`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'disburseFee',
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
        methodName: 'setFeeRecipient',
        payload: [recipientAddress],
      });
    },
  );

vaultOperationsWrite
  .command('change-tier-by-no')
  .alias('ct-no')
  .description(
    'vault tier change by node operator with multi-role confirmation. For disconnected vaults this option is required',
  )
  .argument('<tierId>', 'tier id to change to', stringToBigInt)
  .option(
    '-r, --requestedShareLimit <string>',
    'requested share limit (in shares by default, or in stETH if --steth flag is provided)',
    etherToWei,
  )
  .option('-v, --vault <string>', 'vault address', stringToAddress)
  .option(
    '--steth',
    'interpret requestedShareLimit as stETH value and convert to shares on-chain',
    false,
  )
  .action(
    async (
      tierId: bigint,
      {
        requestedShareLimit,
        vault,
        steth,
      }: { requestedShareLimit: bigint; vault: Address; steth: boolean },
    ) => {
      const { vault: vaultAddress, vaultContract } =
        await chooseVaultAndGetDashboard({
          vault,
        });
      const operatorGridContract = await getOperatorGridContract();

      const vaultNodeOperator = await callReadMethodSilent({
        contract: vaultContract,
        methodName: 'nodeOperator',
        payload: [],
      });

      const tierInfo = await callReadMethodSilent({
        contract: operatorGridContract,
        methodName: 'tier',
        payload: [[tierId]],
      });
      const tierShareLimit = tierInfo.shareLimit;
      let currentShareLimit = tierShareLimit;

      if (requestedShareLimit != null) {
        const resolvedShareLimit = await resolveStethShareLimit(
          requestedShareLimit,
          steth,
        );

        const confirmShareLimit = await confirmOperation(
          `Are you sure you want to request change share limit for vault ${vaultAddress} to ${formatEther(resolvedShareLimit)} shares (requested tier share limit is ${formatEther(tierShareLimit)} shares)?`,
        );
        if (!confirmShareLimit) return;

        currentShareLimit = resolvedShareLimit;
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

      await callWriteMethodsWithReportFresh({
        vault: vaultAddress,
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
  .argument('<tierId>', 'tier id to change to', stringToBigInt)
  .option(
    '-r, --requestedShareLimit <string>',
    'requested share limit (in shares by default, or in stETH if --steth flag is provided)',
    etherToWei,
  )
  .option('-v, --vault <string>', 'vault address', stringToAddress)
  .option(
    '--steth',
    'interpret requestedShareLimit as stETH value and convert to shares on-chain',
    false,
  )
  .action(
    async (
      tierId: bigint,
      {
        requestedShareLimit,
        vault,
        steth,
      }: { requestedShareLimit: bigint; vault: Address; steth: boolean },
    ) => {
      const { contract, vault: vaultAddress } =
        await chooseVaultAndGetDashboard({
          vault,
        });
      const operatorGridContract = await getOperatorGridContract();
      const tierInfo = await callReadMethodSilent({
        contract: operatorGridContract,
        methodName: 'tier',
        payload: [[tierId]],
      });

      const tierShareLimit = tierInfo.shareLimit;

      let currentShareLimit = tierShareLimit;
      if (requestedShareLimit != null) {
        const resolvedShareLimit = await resolveStethShareLimit(
          requestedShareLimit,
          steth,
        );

        const confirmShareLimit = await confirmOperation(
          `Are you sure you want to request change share limit for vault ${vaultAddress} to ${formatEther(resolvedShareLimit)} shares (requested tier share limit is ${formatEther(tierShareLimit)} shares)?`,
        );
        if (!confirmShareLimit) return;

        currentShareLimit = resolvedShareLimit;
      }

      const confirm = await confirmOperation(
        `Are you sure you want to change the current tier to tier ID ${tierId} for vault ${vaultAddress} with share limit ${formatEther(currentShareLimit)} shares?`,
      );
      if (!confirm) return;

      const account = await getAccount();
      await checkVaultRole(
        contract,
        'VAULT_CONFIGURATION_ROLE',
        account.address,
      );

      await callWriteMethodsWithReportFresh({
        vault: vaultAddress,
        contract,
        methodName: 'changeTier',
        payload: [tierId, currentShareLimit],
      });
    },
  );

vaultOperationsWrite
  .command('sync-tier')
  .alias('st')
  .description('requests a sync of tier on the OperatorGrid')
  .option('-v, --vault <string>', 'vault address', stringToAddress)
  .addHelpText(
    'after',
    `Tier sync confirmation logic:
     - Both vault owner (via this function) AND node operator confirmations are required
     - First call returns false (pending), second call with both confirmations completes the sync
     - Confirmations expire after the configured period (default: 1 day)`,
  )
  .action(async ({ vault }: { vault: Address }) => {
    const { contract, vault: vaultAddress } = await chooseVaultAndGetDashboard({
      vault,
    });

    const confirm = await confirmOperation(
      `Are you sure you want to sync the tier of the vault ${vaultAddress}?`,
    );
    if (!confirm) return;

    await callWriteMethodsWithReportFresh({
      vault: vaultAddress,
      contract,
      methodName: 'syncTier',
      payload: [],
    });
  });

vaultOperationsWrite
  .command('role-grant')
  .description('mass-grants multiple roles to multiple accounts.')
  .option(
    '-r, --roleAssignments <string>',
    'JSON array of role assignments',
    jsonToRoleAssignment,
  )
  .option('-v, --vault <string>', 'vault address', stringToAddress)
  .addHelpText(
    'after',
    `Role assignment format:
    [{
      "account": "...",
      "role": "..."
    }
    {second role assignment}
    ...]`,
  )
  .action(
    async ({
      roleAssignments,
      vault,
    }: {
      roleAssignments: RoleAssignment[];
      vault: Address;
    }) => {
      const { contract } = await chooseVaultAndGetDashboard({
        vault,
      });

      let roleAssignmentsValue: RoleAssignment[] = [];
      if (roleAssignments) {
        roleAssignmentsValue = roleAssignments;
      } else {
        roleAssignmentsValue = await askRoleOperationInfo(contract, 'grant');
      }

      const confirm = await logRolesOperations(
        contract,
        roleAssignmentsValue,
        'grant',
      );
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'grantRoles',
        payload: [roleAssignmentsValue],
      });
    },
  );

vaultOperationsWrite
  .command('role-revoke')
  .description('mass-revokes multiple roles from multiple accounts')
  .option(
    '-r, --roleAssignments <string>',
    'JSON array of role assignments',
    jsonToRoleAssignment,
  )
  .option('-v, --vault <string>', 'vault address', stringToAddress)
  .addHelpText(
    'after',
    `Role assignment format:
    [{
      "account": "...",
      "role": "..."
    }
    {second role assignment}
    ...]`,
  )
  .action(
    async ({
      roleAssignments,
      vault,
    }: {
      roleAssignments: RoleAssignment[];
      vault: Address;
    }) => {
      const { contract } = await chooseVaultAndGetDashboard({
        vault,
      });

      let roleAssignmentsValue: RoleAssignment[] = [];
      if (roleAssignments) {
        roleAssignmentsValue = roleAssignments;
      } else {
        roleAssignmentsValue = await askRoleOperationInfo(contract, 'revoke');
      }

      const confirm = await logRolesOperations(
        contract,
        roleAssignmentsValue,
        'revoke',
      );
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'revokeRoles',
        payload: [roleAssignmentsValue],
      });
    },
  );

vaultOperationsWrite
  .command('connect-and-accept-tier')
  .alias('connect-and-accept')
  .description('changes the tier of the vault and connects to VaultHub')
  .argument('<vaultAddress>', 'vault address', stringToAddress)
  .argument('<tierId>', 'tier to change to', stringToBigInt)
  .argument(
    '<requestedShareLimit>',
    'requested new share limit for the vault (in shares by default, or in stETH if --steth flag is provided)',
    etherToWei,
  )
  .option('-f, --fund', 'optional fund the vault with 1 ETH', false)
  .option(
    '--steth',
    'interpret requestedShareLimit as stETH value and convert to shares on-chain',
    false,
  )

  .addHelpText(
    'after',
    `Reverts if settledGrowth is not corrected after the vault is disconnected`,
  )
  .action(
    async (
      vaultAddress: Address,
      tier: bigint,
      requestedShareLimit: bigint,
      { fund, steth }: { fund: boolean; steth: boolean },
    ) => {
      const { contract } = await chooseVaultAndGetDashboard({
        vault: vaultAddress,
      });

      const currentSettledGrowth = await callReadMethodSilent({
        contract,
        methodName: 'settledGrowth',
        payload: [],
      });

      const resolvedShareLimit = await resolveStethShareLimit(
        requestedShareLimit,
        steth,
      );

      const confirm = await confirmOperation(
        `Are you sure you want to change the tier of the vault ${vaultAddress} to ${tier} and connect to VaultHub?
        Requested share limit: ${formatEther(resolvedShareLimit)}
        Current settled growth: ${formatEther(currentSettledGrowth)}
        Fund with 1 ETH: ${fund}`,
      );
      if (!confirm) return;

      let value: bigint | undefined;
      if (!fund) {
        const { isFundConfirmed } =
          await checkVaultAvailableBalance(vaultAddress);
        if (isFundConfirmed) value = parseEther('1');
      } else {
        value = parseEther('1');
      }

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'connectAndAcceptTier',
        payload: [tier, resolvedShareLimit],
        value,
      });
    },
  );

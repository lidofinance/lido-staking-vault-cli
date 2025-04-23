import { Address, Hex, parseEther } from 'viem';
import { Option } from 'commander';
import { getStakingVaultContract } from 'contracts';
import {
  callWriteMethodWithReceipt,
  confirmFund,
  confirmOperation,
  etherToWei,
  getCommandsJson,
  logInfo,
  stringToAddress,
  stringToBigInt,
  stringToBigIntArrayWei,
} from 'utils';

import { vault } from './main.js';

const vaultWrite = vault
  .command('write')
  .aliases(['w'])
  .description('vault write commands');

vaultWrite.addOption(new Option('-cmd2json'));
vaultWrite.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(vaultWrite));
  process.exit();
});

vaultWrite
  .command('fund')
  .description('fund vault')
  .option('-a, --address <address>', 'vault address')
  .option('-e, --ether <ether>', 'amount of ether to be funded (in ETH)')
  .action(async ({ address, ether }: { address: Address; ether: string }) => {
    const { address: vault, amount } = await confirmFund(
      address,
      ether,
      'vault',
    );
    if (!vault || !amount) return;

    const contract = getStakingVaultContract(address);

    await callWriteMethodWithReceipt(contract, 'fund', [], parseEther(amount));
  });

vaultWrite
  .command('withdraw')
  .description('withdraw from vault')
  .argument('<address>', 'vault address', stringToAddress)
  .argument('<recipient>', 'recipient address', stringToAddress)
  .argument('<eth>', 'amount to withdraw (in ETH)', etherToWei)
  .action(async (address: Address, recipient: Address, amount: bigint) => {
    const contract = getStakingVaultContract(address);

    await callWriteMethodWithReceipt(contract, 'withdraw', [recipient, amount]);
  });

// TODO: get more details
vaultWrite
  .command('no-deposit-beacon')
  .description('deposit to beacon chain')
  .argument('<address>', 'vault address', stringToAddress)
  .argument('<amountOfDeposit>', 'amount of deposits', stringToBigInt)
  .argument('<pubkey>', 'pubkey')
  .argument('<signature>', 'signature')
  .argument('<depositDataRoot>', 'depositDataRoot')
  .action(
    async (
      vault: Address,
      amountOfDeposit: bigint,
      pubkey: `0x${string}`,
      signature: `0x${string}`,
      depositDataRoot: `0x${string}`,
    ) => {
      const contract = getStakingVaultContract(vault);

      const payload = [
        {
          pubkey,
          signature,
          amount: amountOfDeposit,
          depositDataRoot,
        },
      ];

      const confirm = await confirmOperation(
        `Are you sure you want to deposit ${amountOfDeposit} to beacon chain for the staking vault ${vault}?`,
      );
      if (!confirm) return;

      await callWriteMethodWithReceipt(contract, 'depositToBeaconChain', [
        payload,
      ]);
    },
  );

// TODO: get more details
vaultWrite
  .command('no-val-exit')
  .description('request to exit validator')
  .argument('<address>', 'vault address', stringToAddress)
  .argument('<validatorPublicKey>', 'validator public key')
  .action(async (address: Address, validatorPublicKey: Address) => {
    const contract = getStakingVaultContract(address);

    const confirm = await confirmOperation(
      `Are you sure you want to request to exit validator ${validatorPublicKey} for the staking vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'requestValidatorExit', [
      validatorPublicKey,
    ]);
  });

vaultWrite
  .command('bc-resume')
  .description('Resumes deposits to beacon chain')
  .argument('<address>', 'vault address', stringToAddress)
  .action(async (address: Address) => {
    const contract = getStakingVaultContract(address);

    const confirm = await confirmOperation(
      `Are you sure you want to resume deposits to beacon chain for the staking vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'resumeBeaconChainDeposits', []);
  });

vaultWrite
  .command('bc-pause')
  .description('Pauses deposits to beacon chain')
  .argument('<address>', 'vault address', stringToAddress)
  .action(async (address: Address) => {
    const contract = getStakingVaultContract(address);

    const confirm = await confirmOperation(
      `Are you sure you want to pause deposits to beacon chain for the staking vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'pauseBeaconChainDeposits', []);
  });

vaultWrite
  .command('report')
  .description(
    'Submits a report containing valuation, inOutDelta, and locked amount',
  )
  .argument('<address>', 'vault address', stringToAddress)
  .argument('<timestamp>', 'timestamp of the report', stringToBigInt)
  .argument(
    '<totalValue>',
    'new total value: validator balances + StakingVault balance',
    stringToBigInt,
  )
  .argument(
    '<inOutDelta>',
    'new net difference between funded and withdrawn ether',
    stringToBigInt,
  )
  .argument('<locked>', 'new amount of locked ether', stringToBigInt)
  .action(
    async (
      address: Address,
      timestamp: bigint,
      totalValue: bigint,
      inOutDelta: bigint,
      locked: bigint,
    ) => {
      const contract = getStakingVaultContract(address);

      await callWriteMethodWithReceipt(contract, 'report', [
        timestamp,
        totalValue,
        inOutDelta,
        locked,
      ]);
    },
  );

vaultWrite
  .command('rebalance')
  .description('Rebalances the vault')
  .argument('<address>', 'vault address', stringToAddress)
  .argument('<amount>', 'amount to rebalance (in ETH)', etherToWei)
  .action(async (address: Address, amount: bigint) => {
    const contract = getStakingVaultContract(address);

    const confirm = await confirmOperation(
      `Are you sure you want to rebalance the vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'rebalance', [amount]);
  });

vaultWrite
  .command('trigger-v-w')
  .description('Trigger validator withdrawal')
  .argument('<address>', 'vault address', stringToAddress)
  .argument('<pubkeys>', 'validator public keys')
  .argument('<amounts>', 'amounts to withdraw (in ETH)', stringToBigIntArrayWei)
  .argument('<refundRecipient>', 'refund recipient address', stringToAddress)
  .action(
    async (
      address: Address,
      pubkeys: Hex[],
      amounts: bigint[],
      refundRecipient: Address,
    ) => {
      const contract = getStakingVaultContract(address);
      const concatenatedPubkeys = pubkeys.join('') as `0x${string}`;

      await callWriteMethodWithReceipt(contract, 'triggerValidatorWithdrawal', [
        concatenatedPubkeys,
        amounts,
        refundRecipient,
      ]);
    },
  );

vaultWrite
  .command('authorize-lido-vault-hub')
  .alias('authorize-hub')
  .description('Authorizes the Lido Vault Hub to manage the staking vault.')
  .argument('<address>', 'vault address', stringToAddress)
  .action(async (address: Address) => {
    const contract = getStakingVaultContract(address);

    const confirm = await confirmOperation(
      `Are you sure you want to authorize the Lido Vault Hub to manage the staking vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'authorizeLidoVaultHub', []);
  });

vaultWrite
  .command('deauthorize-lido-vault-hub')
  .alias('deauthorize-hub')
  .description(
    'Deauthorizes the Lido Vault Hub from managing the staking vault.',
  )
  .argument('<address>', 'dashboard address', stringToAddress)
  .action(async (address: Address) => {
    const contract = getStakingVaultContract(address);

    const confirm = await confirmOperation(
      `Are you sure you want to deauthorize the Lido Vault Hub from managing the staking vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'deauthorizeLidoVaultHub', []);
  });

vaultWrite
  .command('ossify')
  .description('Ossifies the staking vault.')
  .argument('<address>', 'vault address', stringToAddress)
  .action(async (address: Address) => {
    const contract = getStakingVaultContract(address);

    const confirm = await confirmOperation(
      `Are you sure you want to ossify the staking vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'ossifyStakingVault', []);
  });

vaultWrite
  .command('reset-l ocked')
  .description('Resets the locked amount')
  .argument('<address>', 'vault address', stringToAddress)
  .action(async (address: Address) => {
    const contract = getStakingVaultContract(address);

    const confirm = await confirmOperation(
      `Are you sure you want to reset the locked amount for the staking vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'resetLocked', []);
  });

vaultWrite
  .command('set-depositor')
  .description('Sets the depositor')
  .argument('<address>', 'vault address', stringToAddress)
  .argument('<depositor>', 'depositor address', stringToAddress)
  .action(async (address: Address, depositor: Address) => {
    const contract = getStakingVaultContract(address);

    const confirm = await confirmOperation(
      `Are you sure you want to set the depositor for the staking vault ${vault} to ${depositor}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'setDepositor', [depositor]);
  });

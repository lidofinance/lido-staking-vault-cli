import { Address, formatEther, Hex, parseEther } from 'viem';
import { Option } from 'commander';
import { getStakingVaultContract } from 'contracts';
import {
  callWriteMethodWithReceipt,
  confirmFund,
  confirmOperation,
  etherToWei,
  getCommandsJson,
  logInfo,
  parseDeposit,
  stringToAddress,
  stringToBigInt,
  stringToBigIntArrayWei,
  stringToHexArray,
} from 'utils';

import { vault } from './main.js';
import { Deposit } from 'types';

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
    const { address: vaultAddress, amount } = await confirmFund(
      address,
      ether,
      'vault',
    );
    if (!vaultAddress || !amount) return;

    const contract = getStakingVaultContract(vaultAddress);

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'fund',
      payload: [],
      value: parseEther(amount),
    });
  });

vaultWrite
  .command('withdraw')
  .description('withdraw from vault')
  .argument('<address>', 'vault address', stringToAddress)
  .argument('<recipient>', 'recipient address', stringToAddress)
  .argument('<eth>', 'amount to withdraw (in ETH)', etherToWei)
  .action(async (address: Address, recipient: Address, amount: bigint) => {
    const contract = getStakingVaultContract(address);

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'withdraw',
      payload: [recipient, amount],
    });
  });

vaultWrite
  .command('no-deposit-beacon')
  .description(
    'performs deposit to the beacon chain using ether from available balance',
  )
  .argument('<address>', 'vault address', stringToAddress)
  .argument('<amountOfDeposit>', 'amount of deposit (in gwei)', stringToBigInt)
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

      const payload = {
        pubkey,
        signature,
        amount: amountOfDeposit,
        depositDataRoot,
      };

      const confirm = await confirmOperation(
        `Are you sure you want to deposit ${amountOfDeposit} to beacon chain for the staking vault ${vault}?`,
      );
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'depositToBeaconChain',
        payload: [payload],
      });
    },
  );

vaultWrite
  .command('stage')
  .description('puts aside some ether from the balance to deposit it later')
  .argument('<address>', 'vault address', stringToAddress)
  .argument('<amount>', 'amount of ether (in ETH)', etherToWei)
  .action(async (vault: Address, amount: bigint) => {
    const contract = getStakingVaultContract(vault);

    const confirm = await confirmOperation(
      `Are you sure you want to stage ${formatEther(amount)} ETH for the staking vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'stage',
      payload: [amount],
    });
  });

vaultWrite
  .command('unstage')
  .description(
    'returns the ether staged for deposits back to available balance',
  )
  .argument('<address>', 'vault address', stringToAddress)
  .argument('<amount>', 'amount of ether (in ETH)', etherToWei)
  .action(async (vault: Address, amount: bigint) => {
    const contract = getStakingVaultContract(vault);

    const confirm = await confirmOperation(
      `Are you sure you want to unstage ${formatEther(amount)} ETH for the staking vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'unstage',
      payload: [amount],
    });
  });

vaultWrite
  .command('deposit-from-staged')
  .description(
    'performs deposits to the beacon chain using the staged and available ether.',
  )
  .argument('<address>', 'vault address', stringToAddress)
  .argument('<deposit>', 'deposit to deposit', parseDeposit)
  .argument(
    '<additionalAmount>',
    'additional amount to deposit',
    stringToBigInt,
  )
  .action(
    async (vault: Address, deposit: Deposit, additionalAmount: bigint) => {
      const contract = getStakingVaultContract(vault);

      const confirm = await confirmOperation(
        `Are you sure you want to deposit ${formatEther(deposit.amount)} ETH for the staking vault ${vault}?`,
      );
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'depositFromStaged',
        payload: [deposit, additionalAmount],
      });
    },
  );

vaultWrite
  .command('no-val-exit')
  .description(
    'requests node operator to exit validators from the beacon chain. It does not directly trigger exits - node operators must monitor for these events and handle the exits',
  )
  .argument('<address>', 'vault address', stringToAddress)
  .argument(
    '<validatorPublicKeys>',
    'concatenated validator public keys, each 48 bytes long',
  )
  .action(async (address: Address, validatorPublicKeys: Hex) => {
    const contract = getStakingVaultContract(address);

    const confirm = await confirmOperation(
      `Are you sure you want to request to exit validator ${validatorPublicKeys} for the staking vault ${address}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'requestValidatorExit',
      payload: [validatorPublicKeys],
    });
  });

vaultWrite
  .command('bc-resume')
  .description('Resumes deposits to beacon chain')
  .argument('<address>', 'vault address', stringToAddress)
  .action(async (address: Address) => {
    const contract = getStakingVaultContract(address);

    const confirm = await confirmOperation(
      `Are you sure you want to resume deposits to beacon chain for the staking vault ${address}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'resumeBeaconChainDeposits',
      payload: [],
    });
  });

vaultWrite
  .command('bc-pause')
  .description('Pauses deposits to beacon chain')
  .argument('<address>', 'vault address', stringToAddress)
  .action(async (address: Address) => {
    const contract = getStakingVaultContract(address);

    const confirm = await confirmOperation(
      `Are you sure you want to pause deposits to beacon chain for the staking vault ${address}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'pauseBeaconChainDeposits',
      payload: [],
    });
  });

vaultWrite
  .command('trigger-v-w')
  .description('Trigger validator withdrawal')
  .argument('<address>', 'vault address', stringToAddress)
  .argument('<pubkeys>', 'validator public keys', stringToHexArray)
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

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'triggerValidatorWithdrawals',
        payload: [concatenatedPubkeys, amounts, refundRecipient],
      });
    },
  );

vaultWrite
  .command('eject-validators')
  .description('triggers EIP-7002 validator exits by the node operator.')
  .argument('<address>', 'vault address', stringToAddress)
  .argument('<pubkeys>', 'validator public keys', stringToHexArray)
  .argument('<refundRecipient>', 'refund recipient address', stringToAddress)
  .action(
    async (address: Address, pubkeys: Hex[], refundRecipient: Address) => {
      const contract = getStakingVaultContract(address);
      const concatenatedPubkeys = pubkeys.join('') as `0x${string}`;

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'ejectValidators',
        payload: [concatenatedPubkeys, refundRecipient],
      });
    },
  );

vaultWrite
  .command('ossify')
  .description('Ossifies the staking vault.')
  .argument('<address>', 'vault address', stringToAddress)
  .action(async (address: Address) => {
    const contract = getStakingVaultContract(address);

    const confirm = await confirmOperation(
      `Are you sure you want to ossify the staking vault ${address}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'ossify',
      payload: [],
    });
  });

vaultWrite
  .command('set-depositor')
  .description('Sets the depositor')
  .argument('<address>', 'vault address', stringToAddress)
  .argument('<depositor>', 'depositor address', stringToAddress)
  .action(async (address: Address, depositor: Address) => {
    const contract = getStakingVaultContract(address);

    const confirm = await confirmOperation(
      `Are you sure you want to set the depositor for the staking vault ${address} to ${depositor}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'setDepositor',
      payload: [depositor],
    });
  });

vaultWrite
  .command('transfer-ownership')
  .description('Transfers the ownership of the contract to a new owner')
  .argument('<address>', 'vault address', stringToAddress)
  .argument('<newOwner>', 'new owner address', stringToAddress)
  .action(async (address: Address, newOwner: Address) => {
    const contract = getStakingVaultContract(address);

    const confirm = await confirmOperation(
      `Are you sure you want to transfer the ownership of the staking vault ${address} to ${newOwner}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'transferOwnership',
      payload: [newOwner],
    });
  });

vaultWrite
  .command('accept-ownership')
  .description('Accepts the pending owner')
  .argument('<address>', 'vault address', stringToAddress)
  .action(async (address: Address) => {
    const contract = getStakingVaultContract(address);

    const confirm = await confirmOperation(
      `Are you sure you want to accept the ownership of the staking vault ${address}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'acceptOwnership',
      payload: [],
    });
  });

vaultWrite
  .command('collect-erc20')
  .description(
    'collects ERC20 tokens from vault contract balance to the recipient',
  )
  .argument('<address>', 'vault address', stringToAddress)
  .argument(
    '<token>',
    'address of the token to recover or 0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee for ether (EIP-7528)',
    stringToAddress,
  )
  .argument(
    '<amount>',
    'amount of tokens or ether to recover (in ETH)',
    etherToWei,
  )
  .argument('<recipient>', 'address of the recovery recipient', stringToAddress)
  .action(
    async (
      address: Address,
      token: Address,
      amount: bigint,
      recipient: Address,
    ) => {
      const contract = getStakingVaultContract(address);

      const confirm = await confirmOperation(
        `Are you sure you want to recover the token ${token} with amount ${formatEther(amount)} from the dashboard contract ${address} to ${recipient}?`,
      );
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'collectERC20',
        payload: [token, recipient, amount],
      });
    },
  );

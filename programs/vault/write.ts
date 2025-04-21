import { Address, Hex, parseEther } from 'viem';

import { getStakingVaultContract } from 'contracts';
import {
  callWriteMethodWithReceipt,
  confirmFund,
  etherToWei,
  stringToBigInt,
  stringToBigIntArrayWei,
} from 'utils';

import { vault } from './main.js';

vault
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

// TODO: investigate why only owner can fund vault
vault
  .command('withdraw')
  .description('withdraw from vault')
  .argument('<address>', 'vault address')
  .argument('<recipient>', 'recipient address')
  .argument('<eth>', 'amount to withdraw (in ETH)', etherToWei)
  .action(async (address: Address, recipient: Address, amount: bigint) => {
    const contract = getStakingVaultContract(address);

    await callWriteMethodWithReceipt(contract, 'withdraw', [recipient, amount]);
  });

// TODO: get more details
vault
  .command('no-deposit-beacon')
  .description('deposit to beacon chain')
  .argument('<address>', 'vault address')
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

      await callWriteMethodWithReceipt(contract, 'depositToBeaconChain', [
        payload,
      ]);
    },
  );

// TODO: get more details
vault
  .command('no-val-exit')
  .description('request to exit validator')
  .argument('<address>', 'vault address')
  .argument('<validatorPublicKey>', 'validator public key')
  .action(async (address: Address, validatorPublicKey: Address) => {
    const contract = getStakingVaultContract(address);

    await callWriteMethodWithReceipt(contract, 'requestValidatorExit', [
      validatorPublicKey,
    ]);
  });

vault
  .command('bc-resume')
  .description('Resumes deposits to beacon chain')
  .argument('<address>', 'vault address')
  .action(async (address: Address) => {
    const contract = getStakingVaultContract(address);

    await callWriteMethodWithReceipt(contract, 'resumeBeaconChainDeposits', []);
  });

vault
  .command('bc-pause')
  .description('Pauses deposits to beacon chain')
  .argument('<address>', 'vault address')
  .action(async (address: Address) => {
    const contract = getStakingVaultContract(address);

    await callWriteMethodWithReceipt(contract, 'pauseBeaconChainDeposits', []);
  });

vault
  .command('report')
  .description(
    'Submits a report containing valuation, inOutDelta, and locked amount',
  )
  .argument('<address>', 'vault address')
  .argument(
    '<valuation>',
    'New total valuation: validator balances + StakingVault balance',
    stringToBigInt,
  )
  .argument(
    '<inOutDelta>',
    'New net difference between funded and withdrawn ether',
    stringToBigInt,
  )
  .argument('<locked>', 'New amount of locked ether', stringToBigInt)
  .action(
    async (
      address: Address,
      valuation: bigint,
      inOutDelta: bigint,
      locked: bigint,
    ) => {
      const contract = getStakingVaultContract(address);

      await callWriteMethodWithReceipt(contract, 'report', [
        valuation,
        inOutDelta,
        locked,
      ]);
    },
  );

vault
  .command('rebalance')
  .description('Rebalances the vault')
  .argument('<address>', 'vault address')
  .argument('<amount>', 'amount to rebalance (in ETH)', etherToWei)
  .action(async (address: Address, amount: bigint) => {
    const contract = getStakingVaultContract(address);

    await callWriteMethodWithReceipt(contract, 'rebalance', [amount]);
  });

vault
  .command('trigger-v-w')
  .description('Trigger validator withdrawal')
  .argument('<address>', 'vault address')
  .argument('<pubkeys>', 'validator public keys')
  .argument('<amounts>', 'amounts to withdraw (in ETH)', stringToBigIntArrayWei)
  .argument('<refundRecipient>', 'refund recipient address')
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

import { Address, Hex } from 'viem';

import { getStakingVaultContract } from 'contracts';
import { callWriteMethodWithReceipt, confirmFund } from 'utils';

import { vault } from './main.js';

vault
  .command('fund')
  .description('fund vault')
  .option('-a, --address <address>', 'vault address')
  .option('-e, --ether <ether>', 'amount of ether to be funded (in WEI)')
  .action(async ({ address, ether }: { address: Address; ether: string }) => {
    const { address: vault, amount } = await confirmFund(address, ether);
    if (!vault || !amount) return;

    const contract = getStakingVaultContract(address);

    await callWriteMethodWithReceipt(contract, 'fund', [], BigInt(amount));
  });

// TODO: investigate why only owner can fund vault
vault
  .command('withdraw')
  .description('withdraw from vault')
  .argument('<address>', 'vault address')
  .argument('<recipient>', 'recipient address')
  .argument('<wei>', 'amount to withdraw (in WEI)')
  .action(async (address: Address, recipient: Address, amount: string) => {
    const contract = getStakingVaultContract(address);

    await callWriteMethodWithReceipt(contract, 'withdraw', [
      recipient,
      BigInt(amount),
    ]);
  });

// NOs
// TODO: get more details
vault
  .command('no-deposit-beacon')
  .description('deposit to beacon chain')
  .argument('<address>', 'vault address')
  .argument('<amountOfDeposit>', 'amount of deposits')
  .argument('<pubkey>', 'pubkey')
  .argument('<signature>', 'signature')
  .argument('<depositDataRoot>', 'depositDataRoot')
  .action(
    async (
      vault: Address,
      amountOfDeposit: string,
      pubkey: `0x${string}`,
      signature: `0x${string}`,
      depositDataRoot: `0x${string}`,
    ) => {
      const amount = BigInt(amountOfDeposit);
      const contract = getStakingVaultContract(vault);

      const payload = [
        {
          pubkey,
          signature,
          amount,
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
  )
  .argument(
    '<inOutDelta>',
    'New net difference between funded and withdrawn ether',
  )
  .argument('<locked>', 'New amount of locked ether')
  .action(
    async (
      address: Address,
      valuation: string,
      inOutDelta: string,
      locked: string,
    ) => {
      const contract = getStakingVaultContract(address);

      await callWriteMethodWithReceipt(contract, 'report', [
        BigInt(valuation),
        BigInt(inOutDelta),
        BigInt(locked),
      ]);
    },
  );

vault
  .command('rebalance')
  .description('Rebalances the vault')
  .argument('<address>', 'vault address')
  .argument('<amount>', 'amount to rebalance (in WEI)')
  .action(async (address: Address, amount: string) => {
    const contract = getStakingVaultContract(address);

    await callWriteMethodWithReceipt(contract, 'rebalance', [BigInt(amount)]);
  });

vault
  .command('trigger-v-w')
  .description('Trigger validator withdrawal')
  .argument('<address>', 'vault address')
  .argument('<pubkeys>', 'validator public keys')
  .argument('<amounts>', 'amounts to withdraw (in WEI)')
  .argument('<refundRecipient>', 'refund recipient address')
  .action(
    async (
      address: Address,
      pubkeys: Hex[],
      amount: string[],
      refundRecipient: Address,
    ) => {
      const contract = getStakingVaultContract(address);
      const concatenatedPubkeys = pubkeys.join('') as `0x${string}`;

      await callWriteMethodWithReceipt(contract, 'triggerValidatorWithdrawal', [
        concatenatedPubkeys,
        amount.map((a) => BigInt(a)),
        refundRecipient,
      ]);
    },
  );

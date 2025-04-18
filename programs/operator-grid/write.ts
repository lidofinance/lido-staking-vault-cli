import { Address } from 'viem';

import { getOperatorGridContract } from 'contracts';
import {
  callWriteMethodWithReceipt,
  confirmOperation,
  stringToBigInt,
  callReadMethod,
  parseTiers,
  parseTier,
} from 'utils';
import { Tier } from 'types';

import { operatorGrid } from './main.js';

operatorGrid
  .command('register-group')
  .alias('rg')
  .description('register a group')
  .argument('<nodeOperator>', 'node operator address')
  .argument('<shareLimit>', 'share limit', stringToBigInt)
  .action(async (nodeOperator: Address, shareLimit: bigint) => {
    const operatorGridContract = await getOperatorGridContract();

    const confirm = await confirmOperation(
      `Are you sure you want to register group with node operator ${nodeOperator} and share limit ${shareLimit}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(operatorGridContract, 'registerGroup', [
      nodeOperator,
      shareLimit,
    ]);
  });

operatorGrid
  .command('update-group-share-limit')
  .alias('update-sl')
  .description('update group share limit')
  .argument('<nodeOperator>', 'node operator address')
  .argument('<shareLimit>', 'share limit', stringToBigInt)
  .action(async (nodeOperator: Address, shareLimit: bigint) => {
    const operatorGridContract = await getOperatorGridContract();
    const group = await callReadMethod(operatorGridContract, 'group', [
      nodeOperator,
    ]);

    const confirm = await confirmOperation(
      `Are you sure you want to update group share limit for group node operator ${nodeOperator} to ${shareLimit}? Old share limit: ${group.shareLimit}`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(
      operatorGridContract,
      'updateGroupShareLimit',
      [nodeOperator, shareLimit],
    );
  });

operatorGrid
  .command('register-tiers')
  .alias('rt')
  .description('register new tiers')
  .argument('<nodeOperator>', 'node operator address')
  .argument('<tiers>', 'tiers', parseTiers)
  .action(async (nodeOperator: Address, tiers: Tier[]) => {
    const operatorGridContract = await getOperatorGridContract();
    await callReadMethod(operatorGridContract, 'group', [nodeOperator]);

    const confirm = await confirmOperation(
      `Are you sure you want to register tiers for node operator ${nodeOperator} group?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(operatorGridContract, 'registerTiers', [
      nodeOperator,
      tiers,
    ]);
  });

operatorGrid
  .command('alter-tier')
  .alias('at')
  .description('alter tier')
  .argument('<tierId>', 'tier id', stringToBigInt)
  .argument('<tier>', 'tier', parseTier)
  .action(async (tierId: bigint, tier: Tier) => {
    const operatorGridContract = await getOperatorGridContract();
    await callReadMethod(operatorGridContract, 'tier', [tierId]);

    const confirm = await confirmOperation(
      `Are you sure you want to alter tier ${tierId}?
      New tier: ${JSON.stringify(tier)}`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(operatorGridContract, 'alterTier', [
      tierId,
      tier,
    ]);
  });

operatorGrid
  .command('request-tier-change')
  .alias('rtc')
  .description('request tier change')
  .argument('<vault>', 'vault address')
  .argument('<tierId>', 'tier id', stringToBigInt)
  .action(async (vault: Address, tierId: bigint) => {
    const operatorGridContract = await getOperatorGridContract();
    await callReadMethod(operatorGridContract, 'tier', [tierId]);

    const confirm = await confirmOperation(
      `Are you sure you want to request change tier ${tierId} for vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(
      operatorGridContract,
      'requestTierChange',
      [vault, tierId],
    );
  });

operatorGrid
  .command('confirm-tier-change')
  .alias('ctc')
  .description('confirm tier change')
  .argument('<vault>', 'vault address')
  .argument('<tierId>', 'tier id to confirm', stringToBigInt)
  .action(async (vault: Address, tierId: bigint) => {
    const operatorGridContract = await getOperatorGridContract();
    await callReadMethod(operatorGridContract, 'tier', [tierId]);

    const confirm = await confirmOperation(
      `Are you sure you want to confirm tier ${tierId} change for vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(
      operatorGridContract,
      'confirmTierChange',
      [vault, tierId],
    );
  });

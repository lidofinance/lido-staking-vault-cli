import { Address } from 'viem';
import { Option } from 'commander';
import { getOperatorGridContract } from 'contracts';
import {
  callWriteMethodWithReceipt,
  confirmOperation,
  stringToBigInt,
  callReadMethod,
  parseTiers,
  logInfo,
  getCommandsJson,
  stringToBigIntArray,
} from 'utils';
import { Tier } from 'types';

import { operatorGrid } from './main.js';

const operatorGridWrite = operatorGrid
  .command('write')
  .aliases(['w'])
  .description('operator grid write commands');

operatorGridWrite.addOption(new Option('-cmd2json'));
operatorGridWrite.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(operatorGridWrite));
  process.exit();
});

operatorGridWrite
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

    await callWriteMethodWithReceipt({
      contract: operatorGridContract,
      methodName: 'registerGroup',
      payload: [nodeOperator, shareLimit],
    });
  });

operatorGridWrite
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

    await callWriteMethodWithReceipt({
      contract: operatorGridContract,
      methodName: 'updateGroupShareLimit',
      payload: [nodeOperator, shareLimit],
    });
  });

operatorGridWrite
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

    await callWriteMethodWithReceipt({
      contract: operatorGridContract,
      methodName: 'registerTiers',
      payload: [nodeOperator, tiers],
    });
  });

operatorGridWrite
  .command('alter-tiers')
  .alias('at')
  .description('alters multiple tiers')
  .argument('<tierIds>', 'tier ids', stringToBigIntArray)
  .argument('<tiers>', 'tiers', parseTiers)
  .action(async (tierIds: bigint[], tiers: Tier[]) => {
    const operatorGridContract = await getOperatorGridContract();

    const confirm = await confirmOperation(
      `Are you sure you want to alter tiers ${tierIds}?
      New tiers: ${JSON.stringify(tiers)}`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract: operatorGridContract,
      methodName: 'alterTiers',
      payload: [tierIds, tiers],
    });
  });

operatorGridWrite
  .command('request-tier-change')
  .alias('rtc')
  .description('request tier change')
  .argument('<vault>', 'vault address')
  .argument('<tierId>', 'tier id', stringToBigInt)
  .argument('<requestedShareLimit>', 'requested share limit', stringToBigInt)
  .action(
    async (vault: Address, tierId: bigint, requestedShareLimit: bigint) => {
      const operatorGridContract = await getOperatorGridContract();

      const confirm = await confirmOperation(
        `Are you sure you want to request change tier ${tierId} for vault ${vault} with requested share limit ${requestedShareLimit}?`,
      );
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract: operatorGridContract,
        methodName: 'requestTierChange',
        payload: [vault, tierId, requestedShareLimit],
      });
    },
  );

operatorGridWrite
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

    await callWriteMethodWithReceipt({
      contract: operatorGridContract,
      methodName: 'confirmTierChange',
      payload: [vault, tierId],
    });
  });

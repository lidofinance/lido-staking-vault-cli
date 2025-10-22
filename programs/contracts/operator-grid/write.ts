import { Address, formatEther } from 'viem';
import { Option } from 'commander';
import {
  getDashboardContract,
  getOperatorGridContract,
  getVaultHubContract,
} from 'contracts';
import {
  callWriteMethodWithReceipt,
  confirmOperation,
  stringToBigInt,
  callReadMethod,
  parseTiers,
  logInfo,
  getCommandsJson,
  stringToBigIntArray,
  confirmProposal,
  etherToWei,
  callReadMethodSilent,
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
  .argument('<shareLimit>', 'share limit (in shares)', etherToWei)
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
  .argument('<shareLimit>', 'share limit (in shares)', etherToWei)
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
  .command('change-tier')
  .alias('ct')
  .description('vault tier change with multi-role confirmation')
  .argument('<vault>', 'vault address')
  .argument('<tierId>', 'tier id', stringToBigInt)
  .argument(
    '<requestedShareLimit>',
    'requested share limit (in shares)',
    etherToWei,
  )
  .action(
    async (vault: Address, tierId: bigint, requestedShareLimit: bigint) => {
      const operatorGridContract = await getOperatorGridContract();

      const confirm = await confirmOperation(
        `Are you sure you want to request change tier ${tierId} for vault ${vault} with requested share limit ${formatEther(requestedShareLimit)}?`,
      );
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract: operatorGridContract,
        methodName: 'changeTier',
        payload: [vault, tierId, requestedShareLimit],
      });
    },
  );

operatorGridWrite
  .command('sync-tier')
  .alias('st')
  .description('syncs vault tier with current tier params')
  .argument('<vault>', 'vault address')
  .action(async (vault: Address) => {
    const operatorGridContract = await getOperatorGridContract();

    const confirm = await confirmOperation(
      `Are you sure you want to sync the tier of the vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract: operatorGridContract,
      methodName: 'syncTier',
      payload: [vault],
    });
  });

operatorGridWrite
  .command('update-vault-share-limit')
  .alias('usl')
  .description('update vault share limit')
  .argument('<vault>', 'vault address')
  .argument(
    '<requestedShareLimit>',
    'requested share limit (in shares)',
    etherToWei,
  )
  .action(async (vault: Address, requestedShareLimit: bigint) => {
    const operatorGridContract = await getOperatorGridContract();

    const confirm = await confirmOperation(
      `Are you sure you want to update the share limit of the vault ${vault} to ${formatEther(requestedShareLimit)}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract: operatorGridContract,
      methodName: 'updateVaultShareLimit',
      payload: [vault, requestedShareLimit],
    });
  });

operatorGridWrite
  .command('confirm-tier-change')
  .description('Confirms a tier change proposal only for the Node Operator')
  .argument('<vault>', 'vault address')
  .action(async (vault: Address) => {
    const contract = await getOperatorGridContract();

    const vaultHub = await getVaultHubContract();
    const vaultConnection = await callReadMethodSilent(
      vaultHub,
      'vaultConnection',
      [vault],
    );
    const dashboardContract = getDashboardContract(vaultConnection.owner);
    const log = await confirmProposal({
      contract: contract as any,
      vault,
      additionalContracts: [dashboardContract],
    });

    if (!log) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: log.decodedData.functionName as any,
      payload: log.decodedData.args as any,
    });
  });

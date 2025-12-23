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
  logInfo,
  getCommandsJson,
  confirmProposal,
  etherToWei,
  callReadMethodSilent,
  stringToAddress,
} from 'utils';

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
  .argument('<vault>', 'vault address', stringToAddress)
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
    const dashboardContract = await getDashboardContract(vaultConnection.owner);
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

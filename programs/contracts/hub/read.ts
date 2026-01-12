import { Address } from 'viem';
import { Option } from 'commander';

import { getVaultHubContract } from 'contracts';
import { getVaultHubBaseInfo, getVaultHubRoles } from 'features';
import {
  generateReadCommands,
  printError,
  callReadMethod,
  logResult,
  getCommandsJson,
  logInfo,
  stringToAddress,
  callReadMethodSilent,
} from 'utils';
import { VaultHubAbi } from 'abi';

import { vaultHub } from './main.js';
import { readCommandConfig } from './config.js';

const VaultHubRead = vaultHub
  .command('read')
  .aliases(['r'])
  .description('vault hub read commands');

VaultHubRead.addOption(new Option('-cmd2json'));
VaultHubRead.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(VaultHubRead));
  process.exit();
});

// Works fine
VaultHubRead.command('info')
  .description('get vault hub info')
  .action(async () => {
    await getVaultHubBaseInfo();
  });

VaultHubRead.command('roles')
  .description('get vault hub roles')
  .action(async () => {
    await getVaultHubRoles();
  });

generateReadCommands(
  VaultHubAbi,
  getVaultHubContract,
  VaultHubRead,
  readCommandConfig,
);

VaultHubRead.command('vault-info-by-index')
  .aliases(['vi'])
  .description('get vault and vault connection parameters by index')
  .argument('<index>', 'index')
  .action(async (index: string) => {
    const biIndex = BigInt(index);
    const contract = await getVaultHubContract();

    try {
      const vault = await callReadMethod({
        contract,
        methodName: 'vaultByIndex',
        payload: [[biIndex]],
      });
      const vaultConnection = await callReadMethod({
        contract,
        methodName: 'vaultConnection',
        payload: [[vault]],
      });

      logResult({
        data: [
          ['Vault', vault],
          ...Object.entries(vaultConnection).map(([key, value]) => [
            key,
            value.toString(),
          ]),
        ],
      });
    } catch (err) {
      printError(err, 'Error when getting vault and vault socket');
    }
  });

VaultHubRead.command('v-record')
  .aliases(['vr'])
  .description('get the accounting record struct for the given vault')
  .argument('<vault>', 'vault address', stringToAddress)
  .action(async (vault: Address) => {
    const contract = await getVaultHubContract();

    try {
      const vaultRecord = await callReadMethodSilent({
        contract,
        methodName: 'vaultRecord',
        payload: [[vault]],
      });

      logInfo('Vault Record');
      logResult({
        data: [
          ['Max Liability Shares', vaultRecord.maxLiabilityShares.toString()],
          ['Liability Shares', vaultRecord.liabilityShares.toString()],
          ['Minimal Reserve', vaultRecord.minimalReserve.toString()],
          ['Redemption Shares', vaultRecord.redemptionShares.toString()],
          ['Cumulative Lido Fees', vaultRecord.cumulativeLidoFees.toString()],
          ['Settled Lido Fees', vaultRecord.settledLidoFees.toString()],
        ],
      });

      logInfo('Vault Report in hub contract');
      logResult({
        data: [
          ['Report Total Value', vaultRecord.report.totalValue.toString()],
          ['Report In Out Delta', vaultRecord.report.inOutDelta.toString()],
          ['Report Timestamp', vaultRecord.report.timestamp.toString()],
        ],
      });

      logInfo('InOutDelta value 0');
      logResult({
        data: [
          ['InOutDelta Value', vaultRecord.inOutDelta[0]?.value.toString()],
          [
            'InOutDelta Value On Ref Slot',
            vaultRecord.inOutDelta[0]?.valueOnRefSlot.toString(),
          ],
          [
            'InOutDelta Ref Slot',
            vaultRecord.inOutDelta[0]?.refSlot.toString(),
          ],
        ],
      });
      logInfo('InOutDelta value 1');
      logResult({
        data: [
          ['InOutDelta Value', vaultRecord.inOutDelta[1]?.value.toString()],
          [
            'InOutDelta Value On Ref Slot',
            vaultRecord.inOutDelta[1]?.valueOnRefSlot.toString(),
          ],
          [
            'InOutDelta Ref Slot',
            vaultRecord.inOutDelta[1]?.refSlot.toString(),
          ],
        ],
      });
    } catch (err) {
      printError(
        err,
        'Error when getting the accounting record struct for the given vault',
      );
    }
  });

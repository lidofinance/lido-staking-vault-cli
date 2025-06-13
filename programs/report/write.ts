import { Address, Hex } from 'viem';
import { Option, program } from 'commander';
import cliProgress from 'cli-progress';

import { getVaultHubContract } from 'contracts';
import {
  callWriteMethodWithReceipt,
  callReadMethod,
  logInfo,
  getCommandsJson,
  logError,
  getAllVaultsReports,
  getAllVaultsReportProofs,
  fetchAndVerifyFile,
  withInterruptHandling,
  submitReport,
} from 'utils';

import { report } from './main.js';

const reportWrite = report
  .command('write')
  .aliases(['w'])
  .description('report write commands');

reportWrite.addOption(new Option('-cmd2json'));
reportWrite.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(reportWrite));
  process.exit();
});

reportWrite
  .command('by-vault-submit')
  .alias('submit')
  .description('submit report by vault')
  .argument('<vault>', 'vault address')
  .option('-g, --gateway', 'ipfs gateway url')
  .action(async (vault, { gateway }) => {
    await submitReport({ vault, gateway });
  });

reportWrite
  .command('by-vaults-submit')
  .description('submit report for vaults')
  .argument('<vaults...>', 'vaults addresses')
  .option('-g, --gateway', 'ipfs gateway url')
  .option('-e, --skip-error', 'skip error')
  .action(
    withInterruptHandling(async (vaults: Address[], { gateway, skipError }) => {
      const vaultHubContract = await getVaultHubContract();
      const [_vaultsDataTimestamp, _vaultsDataTreeRoot, vaultsDataReportCid] =
        await callReadMethod(vaultHubContract, 'latestReportData');

      const { cacheUse } = program.opts();

      await fetchAndVerifyFile(vaultsDataReportCid, gateway);
      const { vaultReports, proofsCID } = await getAllVaultsReports(
        {
          cid: vaultsDataReportCid,
          gateway,
        },
        cacheUse,
      );

      await fetchAndVerifyFile(proofsCID, gateway);
      const allVaultsProofs = await getAllVaultsReportProofs(
        {
          cid: proofsCID,
          gateway,
        },
        cacheUse,
      );

      const progressBar = new cliProgress.SingleBar(
        {
          format:
            'Progress |{bar}| {percentage}% || {value}/{total} Vaults Updated',
          stopOnComplete: true,
        },
        cliProgress.Presets.shades_classic,
      );

      progressBar.start(vaults.length, 0);
      for (const [_index, vault] of vaults.entries()) {
        const vaultReport = vaultReports.find((v) => v.vault_address === vault);
        if (!vaultReport) {
          logError(`Vault ${vault} not found`);
          continue;
        }
        await callWriteMethodWithReceipt({
          contract: vaultHubContract,
          methodName: 'updateVaultData',
          payload: [
            vault,
            BigInt(vaultReport.total_value_wei),
            BigInt(vaultReport.in_out_delta),
            BigInt(vaultReport.fee),
            BigInt(vaultReport.liability_shares),
            allVaultsProofs[vault]?.proof as Hex[],
          ],
          withSpinner: false,
          silent: true,
          skipError,
        });

        progressBar.increment();
      }

      progressBar.stop();
    }),
  );

reportWrite
  .command('submit-all')
  .description('submit report for all vaults')
  .option('-g, --gateway', 'ipfs gateway url')
  .option('-e, --skip-error', 'skip error')
  .action(
    withInterruptHandling(async ({ gateway, skipError }) => {
      const vaultHubContract = await getVaultHubContract();
      const [_vaultsDataTimestamp, _vaultsDataTreeRoot, vaultsDataReportCid] =
        await callReadMethod(vaultHubContract, 'latestReportData');

      await fetchAndVerifyFile(vaultsDataReportCid, gateway);
      const { cacheUse } = program.opts();

      const { vaultReports, proofsCID } = await getAllVaultsReports(
        {
          cid: vaultsDataReportCid,
          gateway,
        },
        cacheUse,
      );
      await fetchAndVerifyFile(proofsCID, gateway);
      const allVaultsProofs = await getAllVaultsReportProofs(
        {
          cid: proofsCID,
          gateway,
        },
        cacheUse,
      );

      const progressBar = new cliProgress.SingleBar(
        {
          format:
            'Progress |{bar}| {percentage}% || {value}/{total} Vaults Updated',
        },
        cliProgress.Presets.shades_classic,
      );

      progressBar.start(vaultReports.length, 0);

      for (const [_index, report] of vaultReports.entries()) {
        try {
          await callWriteMethodWithReceipt({
            contract: vaultHubContract,
            methodName: 'updateVaultData',
            payload: [
              report.vault_address as Address,
              BigInt(report.total_value_wei),
              BigInt(report.in_out_delta),
              BigInt(report.fee),
              BigInt(report.liability_shares),
              allVaultsProofs[report.vault_address]?.proof as Hex[],
            ],
            withSpinner: false,
            silent: true,
            skipError,
          });
        } catch (err: any) {
          if ('shortMessage' in err)
            logError(err.shortMessage, 'Error when submitting report');
          else logError('Error when submitting report');
        }

        progressBar.increment();
      }

      progressBar.stop();
    }),
  );

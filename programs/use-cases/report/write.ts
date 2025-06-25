import { Address } from 'viem';
import { Option } from 'commander';
import cliProgress from 'cli-progress';

import { getLazyOracleContract } from 'contracts';
import {
  callWriteMethodWithReceipt,
  callReadMethod,
  logInfo,
  getCommandsJson,
  logError,
  fetchAndVerifyFile,
  withInterruptHandling,
  submitReport,
  getReportProofByVaults,
  getReportProofs,
} from 'utils';
import { chooseVaultAndGetDashboard } from 'features';

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
  .option('-v, --vault <string>', 'vault address')
  .option('-g, --gateway', 'ipfs gateway url')
  .action(async ({ vault, gateway }) => {
    const { vault: vaultAddress } = await chooseVaultAndGetDashboard({ vault });

    await submitReport({ vault: vaultAddress, gateway });
  });

reportWrite
  .command('by-vaults-submit')
  .description('submit report for vaults')
  .argument('<vaults...>', 'vaults addresses')
  .option('-g, --gateway', 'ipfs gateway url')
  .option('-e, --skip-error', 'skip error')
  .action(
    withInterruptHandling(async (vaults: Address[], { gateway, skipError }) => {
      const lazyOracleContract = await getLazyOracleContract();
      const [_vaultsDataTimestamp, _vaultsDataTreeRoot, vaultsDataReportCid] =
        await callReadMethod(lazyOracleContract, 'latestReportData');

      await fetchAndVerifyFile(vaultsDataReportCid, gateway);
      const proofs = await getReportProofByVaults({
        cid: vaultsDataReportCid,
        gateway,
        vaults,
      });

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
        const vaultReport = proofs.find((v) => v.data.vaultAddress === vault);
        if (!vaultReport) {
          logError(`Vault ${vault} not found`);
          continue;
        }
        await callWriteMethodWithReceipt({
          contract: lazyOracleContract,
          methodName: 'updateVaultData',
          payload: [
            vault,
            BigInt(vaultReport.data.totalValueWei),
            BigInt(vaultReport.data.fee),
            BigInt(vaultReport.data.liabilityShares),
            BigInt(vaultReport.data.slashingReserve),
            vaultReport.proof,
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
      const lazyOracleContract = await getLazyOracleContract();
      const [_vaultsDataTimestamp, _vaultsDataTreeRoot, vaultsDataReportCid] =
        await callReadMethod(lazyOracleContract, 'latestReportData');

      await fetchAndVerifyFile(vaultsDataReportCid, gateway);

      const proofs = await getReportProofs({
        cid: vaultsDataReportCid,
        gateway,
      });

      const progressBar = new cliProgress.SingleBar(
        {
          format:
            'Progress |{bar}| {percentage}% || {value}/{total} Vaults Updated',
        },
        cliProgress.Presets.shades_classic,
      );

      progressBar.start(proofs.length, 0);

      for (const [_index, report] of proofs.entries()) {
        try {
          await callWriteMethodWithReceipt({
            contract: lazyOracleContract,
            methodName: 'updateVaultData',
            payload: [
              report.data.vaultAddress as Address,
              BigInt(report.data.totalValueWei),
              BigInt(report.data.fee),
              BigInt(report.data.liabilityShares),
              BigInt(report.data.slashingReserve),
              report.proof,
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

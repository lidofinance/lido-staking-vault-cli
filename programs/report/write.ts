import { Address, Hex } from 'viem';
import { Option } from 'commander';
import cliProgress from 'cli-progress';

import { getVaultHubContract } from 'contracts';
import {
  callWriteMethodWithReceipt,
  callReadMethod,
  logInfo,
  getCommandsJson,
  getVaultReport,
  getVaultReportProofByCid,
  confirmPrompt,
  logCancel,
  logError,
  getAllVaultsReports,
  getAllVaultsReportProofs,
  fetchAndVerifyFile,
  logResult,
} from 'utils';

import { report } from './main.js';

const reportWrite = report
  .command('write')
  .aliases(['w'])
  .description('pdg write commands');

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
  .option('-u, --url', 'ipfs gateway url')
  .action(async (vault, { url }) => {
    const vaultHubContract = await getVaultHubContract();
    const [_vaultsDataTimestamp, _vaultsDataTreeRoot, vaultsDataReportCid] =
      await callReadMethod(vaultHubContract, 'latestReportData');

    await fetchAndVerifyFile(vaultsDataReportCid, url);

    const report = await getVaultReport(vault, vaultsDataReportCid, url);
    const reportProof = await getVaultReportProofByCid(vault, report.proofsCID);

    await fetchAndVerifyFile(report.proofsCID, url);

    const { confirm } = await confirmPrompt(
      `Are you sure you want to submit report for vault ${vault}?
        Total value wei: ${report.data.total_value_wei}
        In out delta: ${report.data.in_out_delta}
        Fee: ${report.data.fee}
        Liability shares: ${report.data.liability_shares}
        `,
      'confirm',
    );
    if (!confirm) {
      logCancel('Report not submitted');
      return;
    }

    await callWriteMethodWithReceipt({
      contract: vaultHubContract,
      methodName: 'updateVaultData',
      payload: [
        vault,
        BigInt(report.data.total_value_wei),
        BigInt(report.data.in_out_delta),
        BigInt(report.data.fee),
        BigInt(report.data.liability_shares),
        reportProof.proof as Hex[],
      ],
    });
  });

reportWrite
  .command('by-vaults-submit')
  .description('submit report for vaults')
  .argument('<vaults...>', 'vaults addresses')
  .option('-u, --url', 'ipfs gateway url')
  .action(async (vaults: Address[], { url }) => {
    const vaultHubContract = await getVaultHubContract();
    const [_vaultsDataTimestamp, _vaultsDataTreeRoot, vaultsDataReportCid] =
      await callReadMethod(vaultHubContract, 'latestReportData');

    await fetchAndVerifyFile(vaultsDataReportCid, url);
    const { vaultReports, proofsCID } = await getAllVaultsReports(
      vaultsDataReportCid,
      url,
    );

    await fetchAndVerifyFile(proofsCID, url);
    const allVaultsProofs = await getAllVaultsReportProofs(proofsCID, url);

    const progressBar = new cliProgress.SingleBar(
      {
        format:
          'Progress |{bar}| {percentage}% || {value}/{total} Vaults Updated',
      },
      cliProgress.Presets.shades_classic,
    );

    progressBar.start(vaults.length, 0);
    for (const [index, vault] of vaults.entries()) {
      const vaultReport = vaultReports.find((v) => v.vault_address === vault);
      if (!vaultReport) {
        logError(`Vault ${vault} not found`);
        continue;
      }
      logInfo(`Updating vault report for ${vault}`);
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
      });

      progressBar.increment();
      logInfo(`Successfully updated vault: ${vault} (index ${index})`);
    }

    logResult('Done');
    progressBar.stop();
  });

reportWrite
  .command('submit-all')
  .description('submit report for all vaults')
  .option('-u, --url', 'ipfs gateway url')
  .action(async ({ url }) => {
    const vaultHubContract = await getVaultHubContract();
    const [_vaultsDataTimestamp, _vaultsDataTreeRoot, vaultsDataReportCid] =
      await callReadMethod(vaultHubContract, 'latestReportData');

    await fetchAndVerifyFile(vaultsDataReportCid, url);

    const { vaultReports, proofsCID } = await getAllVaultsReports(
      vaultsDataReportCid,
      url,
    );
    await fetchAndVerifyFile(proofsCID, url);
    const allVaultsProofs = await getAllVaultsReportProofs(proofsCID, url);

    const progressBar = new cliProgress.SingleBar(
      {
        format:
          'Progress |{bar}| {percentage}% || {value}/{total} Vaults Updated',
      },
      cliProgress.Presets.shades_classic,
    );

    progressBar.start(vaultReports.length, 0);

    for (const [index, report] of vaultReports.entries()) {
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
      });

      progressBar.increment();
      logInfo(
        `Successfully updated vault: ${report.vault_address} (index ${index})`,
      );
    }

    logResult('Done');
    progressBar.stop();
  });

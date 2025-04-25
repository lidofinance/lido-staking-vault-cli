import { program } from 'command';
import { Address, Hex } from 'viem';
import { Option } from 'commander';

import {
  getVaultReport,
  getVaultReportProofByCid,
  getAllVaultsReportProofs,
  callReadMethod,
  getReportLeaf,
  getAllVaultsReports,
  logInfo,
  fetchAndVerifyFile,
  getCommandsJson,
  callWriteMethodWithReceipt,
  confirmPrompt,
  logCancel,
  logError,
} from 'utils';
import { getVaultHubContract } from 'contracts';

const report = program.command('report').description('report utilities');
report.addOption(new Option('-cmd2json'));
report.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(report));
  process.exit();
});

report
  .command('by-vault')
  .description('get report by vault')
  .argument('<vault>', 'vault address')
  .option('-u, --url', 'ipfs url')
  .action(async (vault, { url }) => {
    const vaultHubContract = await getVaultHubContract();
    const [_vaultsDataTimestamp, _vaultsDataTreeRoot, vaultsDataReportCid] =
      await callReadMethod(vaultHubContract, 'latestReportData');

    await fetchAndVerifyFile(vaultsDataReportCid, url);

    const report = await getVaultReport(vault, vaultsDataReportCid, url);

    logInfo(report);
  });

report
  .command('all')
  .description('get report by all vaults')
  .option('-u, --url', 'ipfs gateway url')
  .action(async ({ url }) => {
    const vaultHubContract = await getVaultHubContract();
    const [_vaultsDataTimestamp, _vaultsDataTreeRoot, vaultsDataReportCid] =
      await callReadMethod(vaultHubContract, 'latestReportData');

    await fetchAndVerifyFile(vaultsDataReportCid, url);

    const allVaultsReports = await getAllVaultsReports(
      vaultsDataReportCid,
      url,
    );

    logInfo(allVaultsReports);
  });

report
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

    await callWriteMethodWithReceipt(vaultHubContract, 'updateVaultData', [
      vault,
      BigInt(report.data.total_value_wei),
      BigInt(report.data.in_out_delta),
      BigInt(report.data.fee),
      BigInt(report.data.liability_shares),
      reportProof.proof as Hex[],
    ]);
  });

report
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
    for (const vault of vaults) {
      const vaultReport = vaultReports.find((v) => v.vault_address === vault);
      if (!vaultReport) {
        logError(`Vault ${vault} not found`);
        continue;
      }
      logInfo(`Updating vault report for ${vault}`);
      await callWriteMethodWithReceipt(vaultHubContract, 'updateVaultData', [
        vault,
        BigInt(vaultReport.total_value_wei),
        BigInt(vaultReport.in_out_delta),
        BigInt(vaultReport.fee),
        BigInt(vaultReport.liability_shares),
        allVaultsProofs[vault]?.proof as Hex[],
      ]);
    }
  });

report
  .command('check-cid')
  .description('check ipfs CID')
  .option('-u, --url', 'ipfs gateway url')
  .action(async ({ url }) => {
    const vaultHubContract = await getVaultHubContract();
    const [_vaultsDataTimestamp, _vaultsDataTreeRoot, vaultsDataReportCid] =
      await callReadMethod(vaultHubContract, 'latestReportData');

    await fetchAndVerifyFile(vaultsDataReportCid, url);
  });

report
  .command('make-leaf')
  .description('make leaf')
  .argument('<vault>', 'vault address')
  .option('-u, --url', 'ipfs gateway url')
  .action(async (vault, { url }) => {
    const vaultHubContract = await getVaultHubContract();
    const [_vaultsDataTimestamp, _vaultsDataTreeRoot, vaultsDataReportCid] =
      await callReadMethod(vaultHubContract, 'latestReportData');

    await fetchAndVerifyFile(vaultsDataReportCid, url);
    const report = await getVaultReport(vault, vaultsDataReportCid, url);

    const reportLeaf = getReportLeaf(report.data);
    logInfo('local leaf', reportLeaf);
    logInfo('ipfs leaf', report.leaf);
    logInfo('ipfs merkle tree root', report.merkleTreeRoot);
  });

report
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

    for (const [index, report] of vaultReports.entries()) {
      await callWriteMethodWithReceipt(vaultHubContract, 'updateVaultData', [
        report.vault_address as Address,
        BigInt(report.total_value_wei),
        BigInt(report.in_out_delta),
        BigInt(report.fee),
        BigInt(report.liability_shares),
        allVaultsProofs[report.vault_address]?.proof as Hex[],
      ]);

      logInfo(
        `Successfully updated vault: ${report.vault_address} (index ${index})`,
      );
    }
  });

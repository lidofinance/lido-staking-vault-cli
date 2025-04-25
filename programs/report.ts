import { program } from 'command';
import { Hex } from 'viem';
import { Option } from 'commander';

import {
  getVaultReport,
  getReportProofByCid,
  callReadMethod,
  getReportLeaf,
  getAllVaultsReports,
  logInfo,
  fetchAndVerifyFile,
  getCommandsJson,
  callWriteMethodWithReceipt,
  confirmPrompt,
  logCancel,
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
    const reportProof = await getReportProofByCid(vault, report.proofsCID);

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

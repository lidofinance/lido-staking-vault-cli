import { Option } from 'commander';

import {
  callReadMethod,
  fetchAndVerifyFile,
  getAllVaultsReports,
  getCommandsJson,
  getReportLeaf,
  getVaultReport,
  logInfo,
} from 'utils';
import { getVaultHubContract } from 'contracts';

import { report } from './main.js';

const reportRead = report
  .command('read')
  .aliases(['r'])
  .description('report read commands');

reportRead.addOption(new Option('-cmd2json'));
reportRead.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(reportRead));
  process.exit();
});

reportRead
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

reportRead
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

reportRead
  .command('check-cid')
  .description('check ipfs CID')
  .option('-u, --url', 'ipfs gateway url')
  .action(async ({ url }) => {
    const vaultHubContract = await getVaultHubContract();
    const [_vaultsDataTimestamp, _vaultsDataTreeRoot, vaultsDataReportCid] =
      await callReadMethod(vaultHubContract, 'latestReportData');

    await fetchAndVerifyFile(vaultsDataReportCid, url);
  });

reportRead
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

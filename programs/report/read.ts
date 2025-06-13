import { Option } from 'commander';
import { program } from 'command';

import {
  callReadMethod,
  fetchAndVerifyFile,
  getAllVaultsReports,
  getCommandsJson,
  getReportLeaf,
  getVaultReportProof,
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
  .option('-g, --gateway', 'ipfs gateway url')
  .action(async (vault, { gateway }) => {
    const vaultHubContract = await getVaultHubContract();
    const [_vaultsDataTimestamp, _vaultsDataTreeRoot, vaultsDataReportCid] =
      await callReadMethod(vaultHubContract, 'latestReportData');

    await fetchAndVerifyFile(vaultsDataReportCid, gateway);

    const { cacheUse } = program.opts();
    const report = await getVaultReport(
      {
        vault,
        cid: vaultsDataReportCid,
        gateway: gateway,
      },
      cacheUse,
    );

    logInfo(report);
  });

reportRead
  .command('proof-by-vault')
  .description('get proof by vault')
  .argument('<vault>', 'vault address')
  .option('-g, --gateway', 'ipfs gateway url')
  .action(async (vault, { gateway }) => {
    const vaultHubContract = await getVaultHubContract();
    const [_vaultsDataTimestamp, _vaultsDataTreeRoot, vaultsDataReportCid] =
      await callReadMethod(vaultHubContract, 'latestReportData');

    const { cacheUse } = program.opts();
    const proof = await getVaultReportProof(
      {
        vault,
        cid: vaultsDataReportCid,
        gateway,
      },
      cacheUse,
    );

    await fetchAndVerifyFile(vaultsDataReportCid, gateway);

    logInfo(proof);
  });

reportRead
  .command('all')
  .description('get all reports')
  .option('-g, --gateway', 'ipfs gateway url')
  .action(async ({ gateway }) => {
    const vaultHubContract = await getVaultHubContract();
    const [_vaultsDataTimestamp, _vaultsDataTreeRoot, vaultsDataReportCid] =
      await callReadMethod(vaultHubContract, 'latestReportData');

    await fetchAndVerifyFile(vaultsDataReportCid, gateway);

    const { cacheUse } = program.opts();
    const allVaultsReports = await getAllVaultsReports(
      {
        cid: vaultsDataReportCid,
        gateway,
      },
      cacheUse,
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
  .option('-g, --gateway', 'ipfs gateway url')
  .action(async (vault, { gateway }) => {
    const vaultHubContract = await getVaultHubContract();
    const [_vaultsDataTimestamp, _vaultsDataTreeRoot, vaultsDataReportCid] =
      await callReadMethod(vaultHubContract, 'latestReportData');

    await fetchAndVerifyFile(vaultsDataReportCid, gateway);
    const { cacheUse } = program.opts();
    const report = await getVaultReport(
      {
        vault,
        cid: vaultsDataReportCid,
        gateway,
      },
      cacheUse,
    );

    const reportLeaf = getReportLeaf(report.data);
    logInfo('local leaf', reportLeaf);
    logInfo('ipfs leaf', report.leaf);
    logInfo('ipfs merkle tree root', report.merkleTreeRoot);
  });

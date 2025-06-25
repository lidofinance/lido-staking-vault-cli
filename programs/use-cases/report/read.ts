import { Option } from 'commander';
import { program } from 'command';

import {
  callReadMethod,
  fetchAndVerifyFile,
  getAllVaultsReports,
  getCommandsJson,
  getVaultReport,
  logInfo,
  getReportProofByVault,
} from 'utils';
import { getLazyOracleContract } from 'contracts';
import { chooseVaultAndGetDashboard } from 'features';

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
  .command('latest-report-data')
  .aliases(['lrd'])
  .description('get the latest report data')
  .action(async () => {
    const lazyOracleContract = await getLazyOracleContract();
    const [timestamp, root, cid] = await callReadMethod(
      lazyOracleContract,
      'latestReportData',
    );
    logInfo(timestamp, root, cid);
  });

reportRead
  .command('by-vault')
  .description('get report by vault')
  .option('-v, --vault <string>', 'vault address')
  .option('-g, --gateway', 'ipfs gateway url')
  .action(async ({ vault, gateway }) => {
    const { vault: vaultAddress } = await chooseVaultAndGetDashboard({ vault });

    const lazyOracleContract = await getLazyOracleContract();
    const [_vaultsDataTimestamp, _vaultsDataTreeRoot, vaultsDataReportCid] =
      await callReadMethod(lazyOracleContract, 'latestReportData');

    await fetchAndVerifyFile(vaultsDataReportCid, gateway);

    const { cacheUse } = program.opts();
    const report = await getVaultReport(
      {
        vault: vaultAddress,
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
  .option('-v, --vault <string>', 'vault address')
  .option('-g, --gateway', 'ipfs gateway url')
  .action(async ({ vault, gateway }) => {
    const { vault: vaultAddress } = await chooseVaultAndGetDashboard({ vault });

    const lazyOracleContract = await getLazyOracleContract();
    const [_vaultsDataTimestamp, _vaultsDataTreeRoot, vaultsDataReportCid] =
      await callReadMethod(lazyOracleContract, 'latestReportData');

    await fetchAndVerifyFile(vaultsDataReportCid, gateway);
    const proof = await getReportProofByVault({
      vault: vaultAddress,
      cid: vaultsDataReportCid,
      gateway,
    });

    logInfo(proof);
  });

reportRead
  .command('all')
  .description('get all reports')
  .option('-g, --gateway', 'ipfs gateway url')
  .action(async ({ gateway }) => {
    const lazyOracleContract = await getLazyOracleContract();
    const [_vaultsDataTimestamp, _vaultsDataTreeRoot, vaultsDataReportCid] =
      await callReadMethod(lazyOracleContract, 'latestReportData');

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
    const lazyOracleContract = await getLazyOracleContract();
    const [_vaultsDataTimestamp, _vaultsDataTreeRoot, vaultsDataReportCid] =
      await callReadMethod(lazyOracleContract, 'latestReportData');

    await fetchAndVerifyFile(vaultsDataReportCid, url);
  });

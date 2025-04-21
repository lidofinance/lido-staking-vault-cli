import { program } from 'command';
import { Address } from 'viem';
import { Option } from 'commander';

import {
  getVaultReport,
  getReportProof,
  callWriteMethod,
  callReadMethod,
  getReportLeaf,
  getAllVaultsReports,
  logInfo,
  fetchAndVerifyFile,
  getCommandsJson,
} from 'utils';
import { getReportCheckerContract, getVaultHubContract } from 'contracts';

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

    const report = await getVaultReport(vault, vaultsDataReportCid, url);

    logInfo(report);
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
  .command('all')
  .description('get report by all vaults')
  .option('-u, --url', 'ipfs gateway url')
  .action(async ({ url }) => {
    const vaultHubContract = await getVaultHubContract();
    const [_vaultsDataTimestamp, _vaultsDataTreeRoot, vaultsDataReportCid] =
      await callReadMethod(vaultHubContract, 'latestReportData');

    const allVaultsReports = await getAllVaultsReports(
      vaultsDataReportCid,
      url,
    );

    logInfo(allVaultsReports);
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

    const report = await getVaultReport(vault, vaultsDataReportCid, url);

    const reportLeaf = getReportLeaf(report.data);
    logInfo('local leaf', reportLeaf);
    logInfo('ipfs leaf', report.leaf);
    logInfo('ipfs merkle tree root', report.merkleTreeRoot);
  });

report
  .command('set-report-checker-data')
  .description('set report checker data')
  .argument('<vaultsDataTreeRoot>', 'vaults data tree root')
  .argument('<vaultsDataTreeCid>', 'vaults data tree cid')
  .action(async (vaultsDataTreeRoot: Address, vaultsDataTreeCid: Address) => {
    const reportChecker = getReportCheckerContract();

    await callWriteMethod(reportChecker, 'updateReportCheckerData', [
      vaultsDataTreeRoot,
      vaultsDataTreeCid,
    ]);
  });

report
  .command('get-report-checker-data')
  .description('get report checker data')
  .action(async () => {
    const reportChecker = getReportCheckerContract();

    const data = await callReadMethod(reportChecker, 'getReportCheckerData');

    logInfo({
      vaultsDataTreeRoot: data[0],
      vaultsDataTreeCid: data[1],
    });
  });

report
  .command('by-vault-check')
  .description('check report by vault')
  .argument('<vault>', 'vault address')
  .option('-u, --url', 'ipfs gateway url')
  .action(async (vault, { url }) => {
    const vaultHubContract = await getVaultHubContract();
    const [_vaultsDataTimestamp, _vaultsDataTreeRoot, vaultsDataReportCid] =
      await callReadMethod(vaultHubContract, 'latestReportData');

    const report = await getVaultReport(vault, vaultsDataReportCid, url);
    const reportChecker = getReportCheckerContract();
    const vaultProof = await getReportProof(vault, vaultsDataReportCid);
    const reportLeafLocal = getReportLeaf(report.data);

    const txData = {
      vault_address: report.data.vault_address as Address,
      total_value_wei: BigInt(report.data.total_value_wei),
      in_out_delta: BigInt(report.data.in_out_delta),
      fee: BigInt(report.data.fee),
      liability_shares: BigInt(report.data.liability_shares),
      proof: vaultProof.proof as Address[],
    };
    logInfo('txData', txData);
    logInfo('root', report.merkleTreeRoot);
    logInfo('leaf', report.leaf);
    logInfo('leafLocal', reportLeafLocal);

    if (reportLeafLocal !== vaultProof.leaf) {
      throw new Error(
        `Local leaf is not equal to the leaf in the IPFS: ${reportLeafLocal} !== ${report.leaf}`,
      );
    }

    await reportChecker.read.checkReport([
      txData.vault_address,
      txData.total_value_wei,
      txData.in_out_delta,
      txData.fee,
      txData.liability_shares,
      txData.proof,
    ]);

    logInfo('--------------------------------');
    logInfo('Report checked');
    logInfo('--------------------------------');
  });

import { program } from 'command';
import {
  getVaultReport,
  getReportProof,
  callWriteMethod,
  callReadMethod,
  getReportLeaf,
  getAllVaultsReports,
  logInfo,
} from 'utils';
import { getReportCheckerContract } from 'contracts';
import { Address } from 'viem';

const report = program.command('report').description('report utilities');

report
  .command('by-vault')
  .description('get report by vault')
  .argument('<vault>', 'vault address')
  .argument('<cid>', 'cid')
  .option('-u, --url', 'ipfs url')
  .action(async (vault, cid, { url }) => {
    const report = await getVaultReport(vault, cid, url);

    logInfo(report);
  });

report
  .command('by-vault-check')
  .description('check report by vault')
  .argument('<vault>', 'vault address')
  .argument('<cid>', 'cid')
  .option('-u, --url', 'ipfs gateway url')
  .action(async (vault, cid, { url }) => {
    const report = await getVaultReport(vault, cid, url);
    const reportChecker = getReportCheckerContract();
    const vaultProof = await getReportProof(vault, cid);
    const reportLeafLocal = getReportLeaf(report.data);

    const txData = {
      vault_address: report.data.vault_address as Address,
      valuation_wei: BigInt(report.data.valuation_wei),
      in_out_delta: BigInt(report.data.in_out_delta),
      fee: BigInt(report.data.fee),
      shares_minted: BigInt(report.data.shares_minted),
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
      txData.valuation_wei,
      txData.in_out_delta,
      txData.fee,
      txData.shares_minted,
      txData.proof,
    ]);

    logInfo('--------------------------------');
    logInfo('Report checked');
    logInfo('--------------------------------');
  });

report
  .command('by-root-check')
  .description('check report by root')
  .argument('<vault>', 'vault address')
  .argument('<cid>', 'cid')
  .option('-u, --url', 'ipfs gateway url')
  .action(async (vault, cid, { url }) => {
    const report = await getVaultReport(vault, cid, url);

    const root = report.merkleTreeRoot;

    const vaultProof = await getReportProof(root, cid);
    const reportLeafLocal = getReportLeaf(report.data);

    logInfo('root', root);
    logInfo('leaf', report.leaf);
    logInfo('leafLocal', reportLeafLocal);
    logInfo('vaultProof', vaultProof);
  });

report
  .command('all')
  .description('get report by all vaults')
  .argument('<cid>', 'cid')
  .option('-u, --url', 'ipfs gateway url')
  .action(async (cid: string, { url }) => {
    const allVaultsReports = await getAllVaultsReports(cid, url);

    logInfo(allVaultsReports);
  });

report
  .command('create-leaf')
  .description('create leaf')
  .argument('<vault>', 'vault address')
  .argument('<cid>', 'cid')
  .option('-u, --url', 'ipfs gateway url')
  .action(async (vault, cid, { url }) => {
    const report = await getVaultReport(vault, cid, url);

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

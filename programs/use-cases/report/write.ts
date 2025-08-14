import { Address, Hex } from 'viem';
import { Option } from 'commander';

import { getLazyOracleContract } from 'contracts';
import {
  callWriteMethodWithReceiptBatchPayloads,
  callReadMethod,
  logInfo,
  getCommandsJson,
  withInterruptHandling,
  submitReport,
  getReportProofByVaults,
  getReportProofs,
  logError,
} from 'utils';
import { chooseVaultAndGetDashboard, checkQuarantine } from 'features';

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

    await checkQuarantine(vaultAddress);

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

      const proofs = await getReportProofByVaults({
        cid: vaultsDataReportCid,
        gateway,
        vaults,
      });

      const payloads: [Address, bigint, bigint, bigint, bigint, Hex[]][] =
        proofs.map((report) => [
          report.data.vaultAddress as Address,
          BigInt(report.data.totalValueWei),
          BigInt(report.data.fee),
          BigInt(report.data.liabilityShares),
          BigInt(report.data.slashingReserve),
          report.proof,
        ]);

      // TODO: await checkQuarantine(vault);

      await callWriteMethodWithReceiptBatchPayloads({
        contract: lazyOracleContract,
        methodName: 'updateVaultData',
        payloads,
        withSpinner: false,
        silent: true,
        skipError,
      });
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

      const proofs = await getReportProofs({
        cid: vaultsDataReportCid,
        gateway,
      });

      const payloads: [Address, bigint, bigint, bigint, bigint, Hex[]][] =
        // eslint-disable-next-line sonarjs/no-identical-functions
        proofs.map((report) => [
          report.data.vaultAddress as Address,
          BigInt(report.data.totalValueWei),
          BigInt(report.data.fee),
          BigInt(report.data.liabilityShares),
          BigInt(report.data.slashingReserve),
          report.proof,
        ]);

      try {
        await callWriteMethodWithReceiptBatchPayloads({
          contract: lazyOracleContract,
          methodName: 'updateVaultData',
          payloads,
          withSpinner: false,
          silent: true,
          skipError,
        });
      } catch (err: any) {
        if ('shortMessage' in err)
          logError(err.shortMessage, 'Error when submitting report');
        else logError('Error when submitting report');
      }
    }),
  );

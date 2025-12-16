import { spawn } from 'child_process';
import type { RoleAssignment, DashboardOverview } from '../types';
import { runCLICommand, cleanAnsi } from '../helpers';

export const grantRole = (
  dashboardAddress: string,
  roles: RoleAssignment[],
  privateKey: string,
): Promise<void> =>
  runCLICommand(
    [
      'contracts',
      'dashboard',
      'w',
      'role-grant',
      dashboardAddress,
      JSON.stringify(roles),
      '--yes',
    ],
    privateKey,
  );

export const supplyVault = (
  dashboardAddress: string,
  amount: string,
  privateKey: string,
): Promise<void> =>
  runCLICommand(
    ['contracts', 'dashboard', 'w', 'fund', dashboardAddress, amount, '--yes'],
    privateKey,
  );

export const overview = async (
  dashboardAddress: string,
): Promise<DashboardOverview> => {
  return new Promise((resolve, reject) => {
    const cli = spawn('yarn', [
      'lsvCLI',
      'contracts',
      'dashboard',
      'r',
      'overview',
      '--yes',
      dashboardAddress,
    ]);

    let stdout = '';
    let stderr = '';

    cli.stdout.on('data', (data) => {
      stdout += data;
    });
    cli.stderr.on('data', (data) => {
      stderr += data;
    });
    cli.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`CLI exited with code ${code}\n${stderr}`));
      }
      const raw = cleanAnsi(stdout + stderr);
      const lines = raw.split('\n');
      const rowRegex = /^\s*│\s*(.+?)\s*│\s*(.+?)\s*│?$/;

      let healthFactor: string | undefined;
      let reserveRatioPercent: string | undefined;
      let forceRebalanceThreshold: string | undefined;
      let stVaultShareLimitSteth: string | undefined;
      let stVaultShareLimitShares: string | undefined;
      let nodeOperatorFeeRatePercent: string | undefined;
      let utilizationRatioPercent: string | undefined;
      let totalValueEth: string | undefined;
      let liabilitySteth: string | undefined;
      let liabilityShares: string | undefined;
      let availableToWithdrawalEth: string | undefined;
      let idleCapitalEth: string | undefined;
      let lockedEth: string | undefined;
      let totalLockedEth: string | undefined;
      let collateralEth: string | undefined;
      let recentlyRepaidEth: string | undefined;
      let nodeOperatorAccruedFeeEth: string | undefined;
      let reservedEth: string | undefined;
      let settledGrowthEth: string | undefined;
      let totalMintingCapacityShares: string | undefined;
      let totalMintingCapacitySteth: string | undefined;
      let remainingMintingCapacitySteth: string | undefined;
      let remainingMintingCapacityShares: string | undefined;
      let unsettledLidoFeesEth: string | undefined;
      let sharesToBurnShares: string | undefined;
      let tierId: number | undefined;
      let tierShareLimitSteth: string | undefined;
      let tierShareLimitShares: string | undefined;
      let groupShareLimitSteth: string | null | undefined;
      let groupShareLimitShares: string | null | undefined;

      for (const line of lines) {
        const match = line.match(rowRegex);
        if (!match) continue;

        const key = String(match[1]?.trim());
        const value = String(match[2]?.trim());

        switch (key) {
          case 'Health Factor':
            healthFactor = value;
            break;
          case 'Reserve Ratio, %':
            reserveRatioPercent = value;
            break;
          case 'Force Rebalance Threshold':
            forceRebalanceThreshold = value;
            break;
          case 'stVault Share Limit, stETH':
            stVaultShareLimitSteth = value;
            break;
          case 'stVault Share Limit, Shares':
            stVaultShareLimitShares = value;
            break;
          case 'Node Operator Fee Rate, %':
            nodeOperatorFeeRatePercent = value;
            break;
          case 'Utilization Ratio, %':
            utilizationRatioPercent = value;
            break;
          case 'Total Value, ETH':
            totalValueEth = value;
            break;
          case 'Liability, stETH':
            liabilitySteth = value;
            break;
          case 'Liability, Shares':
            liabilityShares = value;
            break;
          case 'Available To Withdrawal, ETH':
            availableToWithdrawalEth = value;
            break;
          case 'Idle Capital, ETH':
            idleCapitalEth = value;
            break;
          case 'Locked, ETH':
            lockedEth = value;
            break;
          case 'Total Locked, ETH':
            totalLockedEth = value;
            break;
          case 'Collateral, ETH':
            collateralEth = value;
            break;
          case 'Recently Repaid, ETH':
            recentlyRepaidEth = value;
            break;
          case 'Node Operator Accrued Fee, ETH':
            nodeOperatorAccruedFeeEth = value;
            break;
          case 'Reserved, ETH':
            reservedEth = value;
            break;
          case 'Settled Growth, ETH':
            settledGrowthEth = value;
            break;
          case 'Total Minting Capacity, Shares':
            totalMintingCapacityShares = value;
            break;
          case 'Total Minting Capacity, stETH':
            totalMintingCapacitySteth = value;
            break;
          case 'Remaining Minting Capacity, stETH':
            remainingMintingCapacitySteth = value;
            break;
          case 'Remaining Minting Capacity, Shares':
            remainingMintingCapacityShares = value;
            break;
          case 'Unsettled Lido Fees, ETH':
            unsettledLidoFeesEth = value;
            break;
          case 'Shares to Burn, Shares':
            sharesToBurnShares = value;
            break;
          case 'Tier ID':
            tierId = Number(value);
            break;
          case 'Tier Share Limit, stETH':
            tierShareLimitSteth = value;
            break;
          case 'Tier Share Limit, Shares':
            tierShareLimitShares = value;
            break;
          case 'Group Share Limit, stETH':
            groupShareLimitSteth = value === 'N/A' ? null : value;
            break;
          case 'Group Share Limit, Shares':
            groupShareLimitShares = value === 'N/A' ? null : value;
            break;
          default:
            break;
        }
      }

      if (
        healthFactor === undefined ||
        reserveRatioPercent === undefined ||
        forceRebalanceThreshold === undefined ||
        !stVaultShareLimitSteth ||
        !stVaultShareLimitShares ||
        !nodeOperatorFeeRatePercent ||
        utilizationRatioPercent === undefined ||
        !totalValueEth ||
        liabilitySteth === undefined ||
        liabilityShares === undefined ||
        availableToWithdrawalEth === undefined ||
        idleCapitalEth === undefined ||
        !lockedEth ||
        !totalLockedEth ||
        !collateralEth ||
        recentlyRepaidEth === undefined ||
        nodeOperatorAccruedFeeEth === undefined ||
        reservedEth === undefined ||
        !settledGrowthEth ||
        !totalMintingCapacityShares ||
        !totalMintingCapacitySteth ||
        !remainingMintingCapacitySteth ||
        !remainingMintingCapacityShares ||
        unsettledLidoFeesEth === undefined ||
        sharesToBurnShares === undefined ||
        tierId === undefined ||
        !tierShareLimitSteth ||
        !tierShareLimitShares ||
        groupShareLimitSteth === undefined ||
        groupShareLimitShares === undefined
      ) {
        return reject(
          new Error(
            'Failed to parse dashboard overview from CLI output:\n' + raw,
          ),
        );
      }

      resolve({
        healthFactor,
        reserveRatioPercent,
        forceRebalanceThreshold,
        stVaultShareLimitSteth,
        stVaultShareLimitShares,
        nodeOperatorFeeRatePercent,
        utilizationRatioPercent,
        totalValueEth,
        liabilitySteth,
        liabilityShares,
        availableToWithdrawalEth,
        idleCapitalEth,
        lockedEth,
        totalLockedEth,
        collateralEth,
        recentlyRepaidEth,
        nodeOperatorAccruedFeeEth,
        reservedEth,
        settledGrowthEth,
        totalMintingCapacityShares,
        totalMintingCapacitySteth,
        remainingMintingCapacitySteth,
        remainingMintingCapacityShares,
        unsettledLidoFeesEth,
        sharesToBurnShares,
        tierId,
        tierShareLimitSteth,
        tierShareLimitShares,
        groupShareLimitSteth,
        groupShareLimitShares,
      });
    });
  });
};

export const minimalReserve = async (
  dashboardAddress: string,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const cli = spawn('yarn', [
      'lsvCLI',
      'contracts',
      'dashboard',
      'r',
      'minimal-reserve',
      dashboardAddress,
    ]);

    let stdout = '';
    let stderr = '';

    cli.stdout.on('data', (data) => {
      stdout += data;
    });

    cli.stderr.on('data', (data) => {
      stderr += data;
    });

    cli.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`CLI exited with code ${code}\n${stderr}`));
      }
      const raw = cleanAnsi(stdout + stderr);
      const lines = raw.split('\n');
      const rowRegex = /^\s*│\s*(.+?)\s*│\s*(.+?)\s*│?$/;

      let minimalReserve: string | undefined;

      for (const line of lines) {
        const match = line.match(rowRegex);
        if (!match) continue;

        const key = String(match[1]?.trim());
        const value = String(match[2]?.trim());

        if (key === 'Result') {
          minimalReserve = value;
          break;
        }
      }

      if (minimalReserve === undefined) {
        return reject(
          new Error('Failed to parse minimal reserve from CLI output:\n' + raw),
        );
      }

      resolve(minimalReserve);
    });
  });
};

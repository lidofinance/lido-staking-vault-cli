import { spawn } from 'child_process';
import type { VaultInfo, OperatorGroupInfo } from '../types';
import { cleanAnsi } from '../helpers';

export const getVaultInfo = async (
  vaultAddress: string,
): Promise<VaultInfo> => {
  return new Promise((resolve, reject) => {
    const cli = spawn('yarn', [
      'lsvCLI',
      'contracts',
      'operator-grid',
      'r',
      'vault-info',
      vaultAddress,
    ]);

    let stdout = '';
    let stderr = '';

    cli.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    cli.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    cli.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`CLI exited with code ${code}\n${stderr}`));
      }

      const raw = cleanAnsi(stdout + stderr);
      const lines = raw.split('\n');
      const rowRegex = /^\s*│\s*(.+?)\s*│\s*(.+?)\s*│?$/;

      let nodeOperator: string | undefined;
      let tierId: number | undefined;
      let shareLimit: string | undefined;
      let reserveRatioBP: string | undefined;
      let forcedRebalanceThresholdBP: string | undefined;
      let infraFeeBP: string | undefined;
      let liquidityFeeBP: string | undefined;
      let reservationFeeBP: string | undefined;

      for (const line of lines) {
        const match = line.match(rowRegex);
        if (!match) continue;

        const key = String(match[1]?.trim());
        const value = String(match[2]?.trim());

        switch (key) {
          case 'Node Operator':
            nodeOperator = value;
            break;
          case 'Tier ID':
            tierId = Number(value);
            break;
          case 'Share Limit':
            shareLimit = value;
            break;
          case 'Reserve Ratio BP':
            reserveRatioBP = value;
            break;
          case 'Forced Rebalance Threshold BP':
            forcedRebalanceThresholdBP = value;
            break;
          case 'Infra Fee BP':
            infraFeeBP = value;
            break;
          case 'Liquidity Fee BP':
            liquidityFeeBP = value;
            break;
          case 'Reservation Fee BP':
            reservationFeeBP = value;
            break;
          default:
            break;
        }
      }

      if (
        nodeOperator === undefined ||
        tierId === undefined ||
        !shareLimit ||
        !reserveRatioBP ||
        !forcedRebalanceThresholdBP ||
        !infraFeeBP ||
        !liquidityFeeBP ||
        !reservationFeeBP
      ) {
        return reject(
          new Error('Failed to parse vault info from CLI output:\n' + raw),
        );
      }

      resolve({
        nodeOperator,
        tierId,
        shareLimit: BigInt(shareLimit),
        reserveRatioBP: BigInt(reserveRatioBP),
        forcedRebalanceThresholdBP: BigInt(forcedRebalanceThresholdBP),
        infraFeeBP: BigInt(infraFeeBP),
        liquidityFeeBP: BigInt(liquidityFeeBP),
        reservationFeeBP: BigInt(reservationFeeBP),
      });
    });
  });
};

export const getGroup = async (
  operatorAddress: string,
): Promise<OperatorGroupInfo> => {
  return new Promise((resolve, reject) => {
    const cli = spawn('yarn', [
      'lsvCLI',
      'contracts',
      'operator-grid',
      'r',
      'group',
      operatorAddress,
    ]);

    let stdout = '';
    let stderr = '';

    cli.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    cli.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    cli.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`CLI exited with code ${code}\n${stderr}`));
      }

      const raw = cleanAnsi(stdout + stderr);
      const lines = raw.split('\n');

      const rowRegex = /^\s*│\s*(.+?)\s*│\s*(.+?)\s*│?$/;

      let shareLimit: string | undefined;
      let liabilityShares: string | undefined;
      let tierIds: number[] | undefined;

      for (const line of lines) {
        const match = line.match(rowRegex);
        if (!match) continue;
        const key = match[1]?.trim();
        const value = match[2]?.trim();

        if (key === 'shareLimit') {
          shareLimit = value;
        } else if (key === 'liabilityShares') {
          liabilityShares = value;
        } else if (key === 'tierIds') {
          if (!value || value.toLowerCase() === 'none' || value === '') {
            tierIds = [];
          } else {
            tierIds = value
              .split(',')
              .map((v) => v.trim())
              .filter((v) => v.length > 0)
              .map((v) => Number(v))
              .filter((n) => Number.isFinite(n));
          }
        }
      }

      if (!shareLimit || !liabilityShares || tierIds === undefined) {
        return reject(
          new Error(
            'Failed to parse operator group info from CLI output:\n' + raw,
          ),
        );
      }

      resolve({
        shareLimit: BigInt(shareLimit),
        liabilityShares: BigInt(liabilityShares),
        tierIds,
      });
    });
  });
};

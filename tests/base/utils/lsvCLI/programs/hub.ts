import { spawn } from 'child_process';
import type { Address } from 'viem';
import { cleanAnsi } from '../helpers';

export const isVaultConnected = async (
  vaultAddress: Address,
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const cli = spawn('yarn', [
      'lsvCLI',
      'contracts',
      'hub',
      'r',
      'is-v-connected',
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

      let result: string | undefined;

      for (const line of lines) {
        const match = line.match(rowRegex);
        if (!match) continue;

        const key = String(match[1]?.trim());
        const value = String(match[2]?.trim());

        if (key === 'Result') {
          result = value;
          break;
        }
      }

      if (result === undefined) {
        return reject(
          new Error(
            'Failed to parse vault connection status from CLI output:\n' + raw,
          ),
        );
      }

      const isConnected = result.toLowerCase() === 'true';
      resolve(isConnected);
    });
  });
};

export const isReportFresh = async (
  vaultAddress: Address,
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const cli = spawn('yarn', [
      'lsvCLI',
      'contracts',
      'hub',
      'r',
      'is-report-fresh',
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

      let result: string | undefined;

      for (const line of lines) {
        const match = line.match(rowRegex);
        if (!match) continue;

        const key = String(match[1]?.trim());
        const value = String(match[2]?.trim());

        if (key === 'Result') {
          result = value;
          break;
        }
      }

      if (result === undefined) {
        return reject(
          new Error(
            'Failed to parse report freshness status from CLI output:\n' + raw,
          ),
        );
      }

      const isFresh = result.toLowerCase() === 'true';
      resolve(isFresh);
    });
  });
};

export const latestReportData = async (
  vaultAddress: Address,
): Promise<{
  totalValue: string;
  inOutDelta: string;
  timestamp: string;
}> => {
  return new Promise((resolve, reject) => {
    const cli = spawn('yarn', [
      'lsvCLI',
      'contracts',
      'hub',
      'r',
      'latest-report-data',
      vaultAddress,
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

      let totalValue: string | undefined;
      let inOutDelta: string | undefined;
      let timestamp: string | undefined;

      for (const line of lines) {
        const match = line.match(rowRegex);
        if (!match) continue;

        const key = String(match[1]?.trim());
        const value = String(match[2]?.trim());

        if (
          key === 'Type' ||
          key === 'Value' ||
          key === 'Method name' ||
          key === 'Contract'
        ) {
          continue;
        }

        switch (key) {
          case 'totalValue':
            totalValue = value;
            break;
          case 'inOutDelta':
            inOutDelta = value;
            break;
          case 'timestamp':
            timestamp = value;
            break;
          default:
            break;
        }
      }

      if (
        totalValue === undefined ||
        inOutDelta === undefined ||
        timestamp === undefined
      ) {
        return reject(
          new Error(
            'Failed to parse latest report data from CLI output:\n' + raw,
          ),
        );
      }

      resolve({
        totalValue,
        inOutDelta,
        timestamp,
      });
    });
  });
};

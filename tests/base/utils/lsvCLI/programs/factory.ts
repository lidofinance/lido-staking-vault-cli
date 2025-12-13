import { spawn } from 'child_process';
import { Address } from 'viem';
import type { CreateVaultParams, VaultCreationResult } from '../types';

export const createVaultConnectedToVh = async (
  params: CreateVaultParams,
): Promise<VaultCreationResult> => {
  const {
    defaultAdmin,
    nodeOperator,
    nodeOperatorManager,
    confirmExpiry,
    nodeOperatorFeeRate,
    privateKey,
    quantity = 1,
    roles = [],
  } = params;

  return new Promise((resolve, reject) => {
    const args = [
      'contracts',
      'factory',
      'write',
      'create-vault',
      defaultAdmin,
      nodeOperator,
      nodeOperatorManager,
      String(confirmExpiry),
      String(nodeOperatorFeeRate),
      String(quantity),
    ];

    if (roles.length > 0) {
      args.push('--yes', '--roles', JSON.stringify(roles));
    }

    const cli = spawn('yarn', ['lsvCLI', ...args], {
      env: {
        ...process.env,
        PRIVATE_KEY: privateKey,
      },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

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

      const vaultLine = stdout
        .split('\n')
        .find((line) => line.includes('Vault Address') && line.includes('0x'));

      const dashboardLine = stdout
        .split('\n')
        .find(
          (line) => line.includes('Dashboard Address') && line.includes('0x'),
        );

      const vaultAddressMatch = vaultLine?.match(/(0x[a-fA-F0-9]{40})/);
      const dashboardAddressMatch = dashboardLine?.match(/(0x[a-fA-F0-9]{40})/);

      if (!vaultAddressMatch?.[1]) {
        return reject(
          new Error('Vault address not found in CLI output:\n' + stdout),
        );
      }

      if (!dashboardAddressMatch?.[1]) {
        return reject(
          new Error('Dashboard address not found in CLI output:\n' + stdout),
        );
      }

      resolve({
        vaultAddress: vaultAddressMatch[1] as Address,
        dashboardAddress: dashboardAddressMatch[1] as Address,
      });
    });

    cli.stdin.end();
  });
};

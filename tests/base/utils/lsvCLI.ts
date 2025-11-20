import { spawn } from 'child_process';
import { Address } from 'viem';

type RoleAssignment = {
  account: string;
  role: Address;
};

type CreateVaultParams = {
  defaultAdmin: string;
  nodeOperator: string;
  nodeOperatorManager: string;
  confirmExpiry: number;
  nodeOperatorFeeRate: number;
  privateKey: string;
  quantity?: number;
  roles?: RoleAssignment[];
  deployedFile?: string;
};

type VaultCreationResult = {
  vaultAddress: string;
  dashboardAddress: string;
};

const runCLICommand = (args: string[], privateKey: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const cli = spawn('yarn', ['lsvCLI', ...args], {
      env: {
        ...process.env,
        PRIVATE_KEY: privateKey,
      },
    });

    let stderr = '';
    cli.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    cli.on('close', (code) => {
      code !== 0
        ? reject(new Error(`CLI exited with code ${code}\n${stderr}`))
        : resolve();
    });
  });

export const createVault = async (
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
        vaultAddress: vaultAddressMatch[1],
        dashboardAddress: dashboardAddressMatch[1],
      });
    });

    cli.stdin.end();
  });
};

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

export const lsvCLI = {
  createVault,
  grantRole,
  supplyVault,
};

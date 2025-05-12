import { Address } from 'viem';

import { getVaultViewerContract } from 'contracts';
import { getAccount } from 'providers';
import { VaultViewerAbi } from 'abi';
import {
  generateReadCommands,
  callReadMethod,
  callReadMethodSilent,
  logTable,
} from 'utils';

import { vaultViewer } from './main.js';
import { readCommandConfig } from './config.js';

generateReadCommands(
  VaultViewerAbi,
  getVaultViewerContract,
  vaultViewer,
  readCommandConfig,
);

vaultViewer
  .command('my')
  .description('get my vaults')
  .option('-s, --simple', 'simple output')
  .action(async ({ simple }: { simple: boolean }) => {
    const contract = getVaultViewerContract();
    const account = getAccount();

    const vaults = await callReadMethodSilent(contract, 'vaultsByOwner', [
      account.address,
    ]);

    if (simple) {
      console.info(vaults);
      return;
    }

    logTable({
      data: vaults.map((vault: string, idx: number) => [idx, vault]),
      params: {
        head: ['Index', 'Vault Address'],
      },
    });
  });

vaultViewer
  .command('my-bound')
  .description('get my vaults - bound')
  .argument('<from>', 'from - vault index')
  .argument('<to>', 'to - vault index')
  .option('-s, --simple', 'simple output')
  .action(async (from: bigint, to: bigint, { simple }: { simple: boolean }) => {
    const contract = getVaultViewerContract();
    const account = getAccount();

    const [vaults] = await callReadMethod(contract, 'vaultsByOwnerBound', [
      account.address,
      from,
      to,
    ]);

    if (simple) {
      console.info(vaults);
      return;
    }

    logTable({
      data: vaults.map((vault: string, idx: number) => [idx, vault]),
      params: {
        head: ['Index', 'Vault Address'],
      },
    });
  });

vaultViewer
  .command('my-by-role')
  .description('get my vaults by role')
  .argument('<role>', 'role')
  .option('-s, --simple', 'simple output')
  .action(async (role: Address, { simple }: { simple: boolean }) => {
    const contract = getVaultViewerContract();
    const account = getAccount();

    const vaults = await callReadMethodSilent(contract, 'vaultsByRole', [
      role,
      account.address,
    ]);

    if (simple) {
      console.info(vaults);
      return;
    }

    logTable({
      data: vaults.map((vault: string, idx: number) => [idx, vault]),
      params: {
        head: ['Index', 'Vault Address'],
      },
    });
  });

vaultViewer
  .command('my-by-role-bound')
  .description('get my vaults by role - bound')
  .argument('<from>', 'from - vault index')
  .argument('<to>', 'to - vault index')
  .option('-s, --simple', 'simple output')
  .action(
    async (
      role: Address,
      from: bigint,
      to: bigint,
      { simple }: { simple: boolean },
    ) => {
      const contract = getVaultViewerContract();
      const account = getAccount();

      const [vaults] = await callReadMethod(contract, 'vaultsByRoleBound', [
        role,
        account.address,
        from,
        to,
      ]);

      if (simple) {
        console.info(vaults);
        return;
      }

      logTable({
        data: vaults.map((vault: string, idx: number) => [idx, vault]),
        params: {
          head: ['Index', 'Vault Address'],
        },
      });
    },
  );

vaultViewer
  .command('connected')
  .description('get vaults connected to vault hub')
  .option('-s, --simple', 'simple output')
  .action(async ({ simple }: { simple: boolean }) => {
    const contract = getVaultViewerContract();

    const vaults = await callReadMethodSilent(contract, 'vaultsConnected');

    if (simple) {
      console.info(vaults);
      return;
    }

    logTable({
      data: vaults.map((vault: string, idx: number) => [idx, vault]),
      params: {
        head: ['Index', 'Vault Address'],
      },
    });
  });

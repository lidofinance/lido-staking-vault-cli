import { Address } from 'viem';

import { getVaultViewerContract } from 'contracts';
import { getAccount } from 'providers';
import { VaultViewerAbi } from 'abi';
import { generateReadCommands, callReadMethod } from 'utils';

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
  .action(async () => {
    const contract = getVaultViewerContract();
    const account = getAccount();

    await callReadMethod(contract, 'vaultsByOwner', [account.address]);
  });

vaultViewer
  .command('my-bound')
  .description('get my vaults - bound')
  .argument('<from>', 'from')
  .argument('<to>', 'to')
  .action(async (from: bigint, to: bigint) => {
    const contract = getVaultViewerContract();
    const account = getAccount();

    await callReadMethod(contract, 'vaultsByOwnerBound', [
      account.address,
      from,
      to,
    ]);
  });

vaultViewer
  .command('my-by-role')
  .description('get my vaults by role')
  .argument('<role>', 'role')
  .action(async (role: Address) => {
    const contract = getVaultViewerContract();
    const account = getAccount();

    await callReadMethod(contract, 'vaultsByRole', [role, account.address]);
  });

vaultViewer
  .command('my-by-role-bound')
  .description('get my vaults by role - bound')
  .argument('<role>', 'role')
  .argument('<from>', 'from')
  .argument('<to>', 'to')
  .action(async (role: Address, from: bigint, to: bigint) => {
    const contract = getVaultViewerContract();
    const account = getAccount();

    await callReadMethod(contract, 'vaultsByRoleBound', [
      role,
      account.address,
      from,
      to,
    ]);
  });

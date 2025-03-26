import { Address } from 'viem';
import { getVaultHubContract } from 'contracts';
import { callWriteMethodWithReceipt, stringToBigInt } from 'utils';

import { vaultHub } from './main.js';

vaultHub
  .command('add-codehash')
  .description('add vault proxy codehash to allowed list')
  .argument('<codehash>', 'codehash vault proxy codehash')
  .action(async (codehash: Address) => {
    const contract = await getVaultHubContract();

    await callWriteMethodWithReceipt(contract, 'addVaultProxyCodehash', [
      codehash,
    ]);
  });

// TODO: replace by voting
vaultHub
  .command('v-connect')
  .description('connects a vault to the hub (vault master role needed)')
  .argument('<address>', 'vault address')
  .argument(
    '<shareLimit>',
    'maximum number of stETH shares that can be minted by the vault',
  )
  .argument('<reserveRatio>', 'minimum Reserve ratio in basis points')
  .argument(
    '<reserveRatioThreshold>',
    'reserve ratio that makes possible to force rebalance on the vault (in basis points)',
  )
  .argument('<treasuryFeeBP>', 'treasury fee in basis points')
  .action(
    async (
      address: Address,
      shareLimit: bigint,
      reserveRatio: bigint,
      reserveRatioThreshold: bigint,
      treasuryFeeBP: bigint,
    ) => {
      const contract = await getVaultHubContract();

      await callWriteMethodWithReceipt(contract, 'connectVault', [
        address,
        shareLimit,
        reserveRatio,
        reserveRatioThreshold,
        treasuryFeeBP,
      ]);
    },
  );

vaultHub
  .command('v-update-share-limit')
  .description('updates share limit for the vault')
  .argument('<address>', 'vault address')
  .argument('<shareLimit>', 'share limit', stringToBigInt)
  .action(async (address: Address, shareLimit: bigint) => {
    const contract = await getVaultHubContract();

    await callWriteMethodWithReceipt(contract, 'updateShareLimit', [
      address,
      shareLimit,
    ]);
  });

vaultHub
  .command('v-disconnect')
  .description('force disconnects a vault from the hub')
  .argument('<address>', 'vault address')
  .action(async (address: Address) => {
    const contract = await getVaultHubContract();
    await callWriteMethodWithReceipt(contract, 'disconnect', [address]);
  });

vaultHub
  .command('v-owner-disconnect')
  .description(
    "disconnects a vault from the hub, msg.sender should be vault's owner",
  )
  .argument('<address>', 'vault address')
  .action(async (address: Address) => {
    const contract = await getVaultHubContract();
    await callWriteMethodWithReceipt(contract, 'voluntaryDisconnect', [
      address,
    ]);
  });

vaultHub
  .command('v-mint')
  .description(
    ' mint StETH shares backed by vault external balance to the receiver address',
  )
  .argument('<address>', 'vault address')
  .argument('<recipient>', 'address of the receiver')
  .argument('<amountOfShares>', 'amount of stETH shares to mint')
  .action(
    async (address: Address, recipient: Address, amountOfShares: string) => {
      const contract = await getVaultHubContract();
      await callWriteMethodWithReceipt(contract, 'mintShares', [
        address,
        recipient,
        BigInt(amountOfShares),
      ]);
    },
  );

vaultHub
  .command('v-burn')
  .description('burn steth shares from the balance of the VaultHub contract')
  .argument('<address>', 'vault address')
  .argument('<amountOfShares>', 'amount of stETH shares to mint')
  .action(async (address: Address, amountOfShares: string) => {
    const contract = await getVaultHubContract();
    await callWriteMethodWithReceipt(contract, 'burnShares', [
      address,
      BigInt(amountOfShares),
    ]);
  });

vaultHub
  .command('v-transfer-and-burn')
  .description(
    'separate burn function for EOA vault owners; requires vaultHub to be approved to transfer stETH',
  )
  .argument('<address>', 'vault address')
  .argument('<amountOfShares>', 'amount of stETH shares to mint')
  .action(async (address: Address, amountOfShares: string) => {
    const contract = await getVaultHubContract();
    await callWriteMethodWithReceipt(contract, 'transferAndBurnShares', [
      address,
      BigInt(amountOfShares),
    ]);
  });

vaultHub
  .command('v-force-rebalance')
  .description('force rebalance of the vault to have sufficient reserve ratio')
  .argument('<address>', 'vault address')
  .action(async (address: Address) => {
    const contract = await getVaultHubContract();
    await callWriteMethodWithReceipt(contract, 'forceRebalance', [address]);
  });

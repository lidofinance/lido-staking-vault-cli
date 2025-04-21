import { Address, Hex } from 'viem';
import { Option } from 'commander';

import { getOperatorGridContract, getVaultHubContract } from 'contracts';
import {
  callReadMethod,
  callWriteMethodWithReceipt,
  confirmOperation,
  getCommandsJson,
  logInfo,
  stringToBigInt,
} from 'utils';

import { vaultHub } from './main.js';

const VaultHubWrite = vaultHub
  .command('write')
  .aliases(['w'])
  .description('vault hub write commands');

VaultHubWrite.addOption(new Option('-cmd2json'));
VaultHubWrite.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(VaultHubWrite));
  process.exit();
});

VaultHubWrite.command('add-codehash')
  .description('add vault proxy codehash to allowed list')
  .argument('<codehash>', 'codehash vault proxy codehash')
  .action(async (codehash: Address) => {
    const contract = await getVaultHubContract();

    const confirm = await confirmOperation(
      `Are you sure you want to add the vault proxy codehash to the allowed list?
      ${codehash}`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'addVaultProxyCodehash', [
      codehash,
    ]);
  });

// TODO: replace by voting
VaultHubWrite.command('v-connect')
  .description('connects a vault to the hub (vault master role needed)')
  .argument('<address>', 'vault address')
  .action(async (address: Address) => {
    const contract = await getVaultHubContract();
    const operatorGridContract = await getOperatorGridContract();

    const [shareLimit, reserveRatio, reserveRatioThreshold, treasuryFeeBP] =
      await callReadMethod(operatorGridContract, 'vaultInfo', [address]);

    const confirm = await confirmOperation(
      `Are you sure you want to connect the vault ${address} with share limit ${shareLimit}, reserve ratio ${reserveRatio}, reserve ratio threshold ${reserveRatioThreshold}, treasury fee ${treasuryFeeBP}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'connectVault', [address]);
  });

VaultHubWrite.command('v-update-share-limit')
  .description('updates share limit for the vault')
  .argument('<address>', 'vault address')
  .argument('<shareLimit>', 'share limit', stringToBigInt)
  .action(async (address: Address, shareLimit: bigint) => {
    const contract = await getVaultHubContract();

    const confirm = await confirmOperation(
      `Are you sure you want to update the share limit for the vault ${address} to ${shareLimit}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'updateShareLimit', [
      address,
      shareLimit,
    ]);
  });

VaultHubWrite.command('v-disconnect')
  .description('force disconnects a vault from the hub')
  .argument('<address>', 'vault address')
  .action(async (address: Address) => {
    const contract = await getVaultHubContract();

    const confirm = await confirmOperation(
      `Are you sure you want to force disconnect the vault ${address}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'disconnect', [address]);
  });

VaultHubWrite.command('v-owner-disconnect')
  .description(
    "disconnects a vault from the hub, msg.sender should be vault's owner",
  )
  .argument('<address>', 'vault address')
  .action(async (address: Address) => {
    const contract = await getVaultHubContract();

    const confirm = await confirmOperation(
      `Are you sure you want to disconnect the vault ${address}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'voluntaryDisconnect', [
      address,
    ]);
  });

VaultHubWrite.command('v-mint')
  .description(
    ' mint StETH shares backed by vault external balance to the receiver address',
  )
  .argument('<address>', 'vault address')
  .argument('<recipient>', 'address of the receiver')
  .argument('<amountOfShares>', 'amount of stETH shares to mint')
  .action(
    async (address: Address, recipient: Address, amountOfShares: string) => {
      const contract = await getVaultHubContract();

      const confirm = await confirmOperation(
        `Are you sure you want to mint ${amountOfShares} stETH shares to ${recipient}?`,
      );
      if (!confirm) return;

      await callWriteMethodWithReceipt(contract, 'mintShares', [
        address,
        recipient,
        BigInt(amountOfShares),
      ]);
    },
  );

VaultHubWrite.command('v-burn')
  .description('burn steth shares from the balance of the VaultHub contract')
  .argument('<address>', 'vault address')
  .argument('<amountOfShares>', 'amount of stETH shares to mint')
  .action(async (address: Address, amountOfShares: string) => {
    const contract = await getVaultHubContract();

    const confirm = await confirmOperation(
      `Are you sure you want to burn ${amountOfShares} stETH shares from vault ${address}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'burnShares', [
      address,
      BigInt(amountOfShares),
    ]);
  });

VaultHubWrite.command('v-transfer-and-burn')
  .description(
    'separate burn function for EOA vault owners; requires vaultHub to be approved to transfer stETH',
  )
  .argument('<address>', 'vault address')
  .argument('<amountOfShares>', 'amount of stETH shares to mint')
  .action(async (address: Address, amountOfShares: string) => {
    const contract = await getVaultHubContract();

    const confirm = await confirmOperation(
      `Are you sure you want to transfer and burn ${amountOfShares} stETH shares from vault ${address}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'transferAndBurnShares', [
      address,
      BigInt(amountOfShares),
    ]);
  });

VaultHubWrite.command('v-force-rebalance')
  .description('force rebalance of the vault to have sufficient reserve ratio')
  .argument('<address>', 'vault address')
  .action(async (address: Address) => {
    const contract = await getVaultHubContract();

    const confirm = await confirmOperation(
      `Are you sure you want to force rebalance the vault ${address}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'forceRebalance', [address]);
  });

VaultHubWrite.command('v-update-connection')
  .description('updates the vault`s connection parameters')
  .argument('<address>', 'vault address')
  .argument('<shareLimit>', 'share limit', stringToBigInt)
  .argument('<reserveRatio>', 'reserve ratio', stringToBigInt)
  .argument(
    '<reserveRatioThreshold>',
    'reserve ratio threshold',
    stringToBigInt,
  )
  .argument('<treasuryFeeBP>', 'treasury fee', stringToBigInt)
  .action(
    async (
      address: Address,
      shareLimit: bigint,
      reserveRatio: bigint,
      reserveRatioThreshold: bigint,
      treasuryFeeBP: bigint,
    ) => {
      const contract = await getVaultHubContract();

      const confirm = await confirmOperation(
        `Are you sure you want to update the vault ${address} connection parameters to share limit ${shareLimit}, reserve ratio ${reserveRatio}, reserve ratio threshold ${reserveRatioThreshold}, treasury fee ${treasuryFeeBP}?`,
      );
      if (!confirm) return;

      await callWriteMethodWithReceipt(contract, 'updateConnection', [
        address,
        shareLimit,
        reserveRatio,
        reserveRatioThreshold,
        treasuryFeeBP,
      ]);
    },
  );

VaultHubWrite.command('update-report-data')
  .description('updates the report data for the vault')
  .argument('<vaultsDataTimestamp>', 'vaults data timestamp', stringToBigInt)
  .argument('<vaultsDataTreeRoot>', 'vaults data tree root')
  .argument('<vaultsDataReportCid>', 'vaults data report cid')
  .action(
    async (
      vaultsDataTimestamp: bigint,
      vaultsDataTreeRoot: Hex,
      vaultsDataReportCid: Hex,
    ) => {
      const contract = await getVaultHubContract();

      const confirm = await confirmOperation(
        `Are you sure you want to update the report data for the vaults data timestamp ${vaultsDataTimestamp}?`,
      );
      if (!confirm) return;

      await callWriteMethodWithReceipt(contract, 'updateReportData', [
        vaultsDataTimestamp,
        vaultsDataTreeRoot,
        vaultsDataReportCid,
      ]);
    },
  );

VaultHubWrite.command('v-force-validator-exit')
  .description('force validator exit')
  .argument('<vaultAddress>', 'vault address')
  .argument('<validatorPubkey>', 'validator pubkey')
  .argument('<refundRecipient>', 'refund recipient')
  .action(
    async (
      vaultAddress: Address,
      validatorPubkey: Hex,
      refundRecipient: Address,
    ) => {
      const contract = await getVaultHubContract();

      const confirm = await confirmOperation(
        `Are you sure you want to force validator exit for validator pubkey ${validatorPubkey} and refund recipient ${refundRecipient} in vault ${vaultAddress}?`,
      );
      if (!confirm) return;

      await callWriteMethodWithReceipt(contract, 'forceValidatorExit', [
        vaultAddress,
        validatorPubkey,
        refundRecipient,
      ]);
    },
  );

VaultHubWrite.command('v-update-vault-data')
  .description('permissionless update of the vault data')
  .argument('<vaultAddress>', 'vault address')
  .argument('<totalValue>', 'total value', stringToBigInt)
  .argument('<inOutDelta>', 'in/out delta', stringToBigInt)
  .argument('<feeSharesCharged>', 'fee shares charged', stringToBigInt)
  .argument('<liabilityShares>', 'liability shares', stringToBigInt)
  .argument('<proof>', 'proof')
  .action(
    async (
      vaultAddress: Address,
      totalValue: bigint,
      inOutDelta: bigint,
      feeSharesCharged: bigint,
      liabilityShares: bigint,
      proof: Hex[],
    ) => {
      const contract = await getVaultHubContract();

      const confirm = await confirmOperation(
        `Are you sure you want to update the vault data for the vault ${vaultAddress}?`,
      );
      if (!confirm) return;

      await callWriteMethodWithReceipt(contract, 'updateVaultData', [
        vaultAddress,
        totalValue,
        inOutDelta,
        feeSharesCharged,
        liabilityShares,
        proof,
      ]);
    },
  );

VaultHubWrite.command('mint-vaults-treasury-fee-shares')
  .description('mint vaults treasury fee shares')
  .argument('<amountOfShares>', 'amount of shares', stringToBigInt)
  .action(async (amountOfShares: bigint) => {
    const contract = await getVaultHubContract();

    const confirm = await confirmOperation(
      `Are you sure you want to mint ${amountOfShares} treasury fee shares?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'mintVaultsTreasuryFeeShares', [
      amountOfShares,
    ]);
  });

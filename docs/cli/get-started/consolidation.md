---
title: Validator Consolidation
description: Consolidate validators in Lido Staking Vaults using EIP-7251
sidebar_position: 9
---

# Validator Consolidation

This guide walks through consolidating validators in Lido Staking Vaults using the [EIP-7251](https://eips.ethereum.org/EIPS/eip-7251) mechanism. Consolidation merges the balance of one or more source validators into a single target validator.

:::warning **Consolidation is irreversible**
Once submitted, consolidation requests cannot be cancelled. Verify all pubkeys and parameters before confirming.
:::

## Why Consolidate?

- Reduce the number of active validators while preserving total staked ETH
- Lower ongoing validator maintenance overhead
- Fix node operator fee calculation after migrating validators to vault withdrawal credentials

## Prerequisites

Before starting, ensure:

1. **Role**: Your account must have `NODE_OPERATOR_FEE_EXEMPT_ROLE` on the Dashboard contract
2. **Fresh report**: A fresh oracle report must be submitted to the vault (`yarn start report w by-vault-submit`)
3. **Validator eligibility**: Source validators must be active on the Beacon Chain and eligible for consolidation
4. **Target validator WC**: Target validators must have **vault withdrawal credentials** (0x02-type pointing to the StakingVault)
5. **WalletConnect** (for batch mode): Required when using `--batch` flag

Check your role on the Dashboard:

```bash
yarn start vo r roles -v <vault_address>
```

## Prepare Consolidation Config

The easiest way to define consolidation pairs is a JSON file mapping each target pubkey to an array of source pubkeys.

**Format (`consolidation-config.json`):**

```json
{
  "0x<target_pubkey_1>": ["0x<source_pubkey_1a>", "0x<source_pubkey_1b>"],
  "0x<target_pubkey_2>": ["0x<source_pubkey_2a>"]
}
```

- Each key is a **target** validator pubkey (48-byte BLS key, 96 hex chars with `0x` prefix)
- Each value is an array of **source** validator pubkeys to consolidate into that target
- Source validators' balances will be swept into the target validator

## Step-by-Step

### 1. Submit a Fresh Report

```bash
yarn start report w by-vault-submit -v <vault_address>
```

### 2. Verify Validators on Beacon Chain

Check validator status before consolidating:

```bash
# Check source validator
yarn start pdg-helpers validator-info 0x<source_pubkey>

# Check target validator
yarn start pdg-helpers validator-info 0x<target_pubkey>
```

Both must be in `active_ongoing` status. Inactive validators are automatically filtered out with a warning, but it's better to verify upfront.

### 3. Run Consolidation

**Using a JSON file (recommended for multiple validators):**

```bash
yarn start consolidation w consolidate <dashboard_address> \
  --file ./consolidation-config.json
```

**Using command-line arguments (single pair):**

```bash
yarn start consolidation w consolidate <dashboard_address> \
  --source "0x<source_pubkey>" \
  --target "0x<target_pubkey>"
```

**Multiple source groups via CLI:**

```bash
yarn start consolidation w consolidate <dashboard_address> \
  --source "0xaaa... 0xbbb...,0xccc... 0xddd..." \
  --target "0xeee...,0xfff..."
```

Each comma-separated group of source pubkeys maps to the corresponding target pubkey.

### 4. Review and Confirm

The CLI displays a table with all source and target validators before executing. Review carefully:

- Verify all pubkey pairs are correct
- Check the fee exemption amount to be set
- Confirm no unintended validators are included

The fee exemption is a **per-batch delta** on the contract side (`addFeeExemption` increases `settledGrowth` by the given amount), so it is added for every consolidation batch. The node-operator fee is based on vault growth above `settledGrowth`, so without the exemption the consolidated balance stays in the fee base once the consolidation is processed and reported.

The only reason to skip is a retry: if the exemption for this exact batch was already submitted in a previous run. The CLI detects this automatically — when a recent on-chain fee exemption with the same amount exists, it shows the transaction hash and asks whether that transaction covered this same batch. Otherwise the exemption is added without extra prompts.

### 5. Monitor on Beacon Chain

After submission, consolidation is processed at the consensus layer. Track progress via a Beacon Chain explorer or:

```bash
yarn start pdg-helpers validator-info 0x<target_pubkey>
```

## Batch Mode (Gas-Efficient)

Use `--batch` to bundle all consolidation requests and the fee exemption into a single multicall transaction. **Requires `--wallet-connect`.**

```bash
yarn start consolidation w consolidate <dashboard_address> \
  --file ./consolidation-config.json \
  --batch \
  --wallet-connect
```

Without `--batch`, each consolidation request and the fee exemption are sent as separate transactions (more flexible but less gas-efficient).

## Error Reference

| Error                                   | Cause                                     | Solution                                                      |
| --------------------------------------- | ----------------------------------------- | ------------------------------------------------------------- |
| Missing `NODE_OPERATOR_FEE_EXEMPT_ROLE` | Account lacks required role               | Contact vault admin to grant the role                         |
| Report not fresh                        | Oracle data is stale                      | Run `report w by-vault-submit` first                          |
| Invalid pubkey format                   | Pubkey is not 48-byte hex                 | Verify pubkey format (must be `0x` + 96 hex chars)            |
| Mismatched array lengths                | `--source` and `--target` counts differ   | Ensure equal number of source groups and targets              |
| Batch without WalletConnect             | `--batch` used without `--wallet-connect` | Add `--wallet-connect` flag                                   |
| Inactive validators                     | Source validator is not active            | Inactive validators are auto-filtered; check validator status |
| Invalid withdrawal credentials          | Target validator WC not pointing to vault | Target must use 0x02-type WC pointing to StakingVault         |

## Related Commands

- **Commands reference**: [Consolidation Commands](../commands/consolidation.md)
- **Check validator info**: `yarn start pdg-helpers validator-info <pubkey>`
- **Submit report**: `yarn start report w by-vault-submit`
- **Check roles**: `yarn start vo r roles`

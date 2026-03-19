---
title: Quick Reference
description: Common CLI commands at a glance
sidebar_position: 10
---

# Quick Reference

Common commands grouped by task. For full details on each command see the [Commands Reference](/category/commands).

## Setup & Verification

```bash
# Check account balance and wallet address
yarn start account r info

# Verify network / VaultHub connectivity
yarn start contracts hub r info

# List all vaults connected to VaultHub
yarn start contracts hub r v-count
yarn start contracts hub r v-by-index <index>
```

## Vault Monitoring

```bash
# Overview with health factor and capacity
yarn start vo r overview -v <vault>

# Current health status
yarn start vo r health -v <vault>

# Full configuration (fees, limits, addresses)
yarn start vo r info -v <vault>

# Role holders
yarn start vo r roles -v <vault>
```

## Fund & Withdraw

```bash
# Fund vault with ETH
yarn start vo w fund <amount> -v <vault>

# Withdraw ETH from vault
yarn start vo w withdraw <amount> -v <vault> -r <recipient>
```

## Mint & Burn

```bash
# Mint stETH  (requires MINT_ROLE, fresh report, capacity)
yarn start vo w mint-steth <amount> -v <vault> -r <recipient>
yarn start vo w mint-wsteth <amount> -v <vault> -r <recipient>

# Burn stETH  (requires BURN_ROLE, token approval)
yarn start vo w burn-steth <amount> -v <vault>
yarn start vo w burn-wsteth <amount> -v <vault>

# Set stETH allowance for Dashboard before burning
yarn start account w steth-allowance <dashboard_address> <amount>
```

## Reports (Oracle)

```bash
# Check latest oracle report
yarn start report r latest-report-data

# Submit report for one vault (permissionless)
yarn start report w by-vault-submit -v <vault>

# Submit reports for all vaults
yarn start report w submit-all
```

## Validator Deposits

```bash
# 1. Check node operator balance in PDG
yarn start deposits r no-balance

# 2. Top up node operator balance (1 ETH per validator)
yarn start deposits w top-up-no <amount>

# 3. Predeposit validators (1 ETH each from vault)
yarn start deposits w predeposit '[{"pubkey":"0x...","signature":"0x...","amount":"1000000000","deposit_data_root":"0x..."}]'

# 4. Check validator status
yarn start deposits r validator-status <pubkey>
yarn start pdg-helpers validator-info <pubkey>

# 5. Prove and activate validator (31 ETH from vault staged balance)
yarn start deposits w prove-and-activate -i <validator_index>

# Shortcut: prove + activate + optional top-up in one command
yarn start deposits w prove-and-top-up <indexes> <amounts> -v <vault>
# e.g.: yarn start deposits w prove-and-top-up 12345,12346 0,1.5 -v 0x...
```

## Node Operator Balance

```bash
# Check balances (total / locked / unlocked)
yarn start deposits r no-balance
yarn start deposits r no-info

# Top up balance
yarn start deposits w top-up-no <amount>

# Withdraw unlocked balance
yarn start deposits w withdraw-no-balance <amount> -r <recipient>

# Set guarantor
yarn start deposits w set-no-guarantor

# Set depositor
yarn start deposits w set-no-depositor -d <depositor>
```

## Metrics & Analytics

```bash
# Latest period statistics
yarn start metrics r statistic -v <vault>

# Statistics for last N reports
yarn start metrics r statistic-by-reports <N> -v <vault>

# Raw report data for N reports (exportable)
yarn start metrics r report-data <N> -v <vault> --csv ./data.csv

# APR chart (interactive)
yarn start metrics r charts-apr <N> -v <vault>

# Rewards chart (interactive)
yarn start metrics r charts-rewards <N> -v <vault>
```

## Role Management

```bash
# Grant roles (interactive or via JSON)
yarn start vo w role-grant -v <vault>

# Revoke roles
yarn start vo w role-revoke -v <vault>

# Check token allowances
yarn start account r get-steth-allowance <spender>
yarn start account r get-wsteth-allowance <spender>
```

## Node Operator Fee

```bash
# Disburse accrued fee to recipient
yarn start vo w disburse-node-operator-fee -v <vault>

# Set fee recipient address
yarn start vo w set-no-f-r -v <vault> -rec <address>
```

## Consolidation

```bash
# Consolidate validators using JSON config file
yarn start consolidation w consolidate <dashboard> --file ./config.json

# Batch mode (requires --wallet-connect)
yarn start consolidation w consolidate <dashboard> --file ./config.json --batch --wallet-connect
```

## Useful Global Flags

| Flag               | Effect                                |
| ------------------ | ------------------------------------- |
| `--json`           | Machine-readable JSON output          |
| `--populate-tx`    | Print raw transaction without sending |
| `-y, --yes`        | Skip confirmation prompts             |
| `--wallet-connect` | Sign via WalletConnect                |
| `--csv <file>`     | Export table output to CSV            |

## Command Aliases Reference

| Full form                         | Short alias          |
| --------------------------------- | -------------------- |
| `read`                            | `r`                  |
| `write`                           | `w`                  |
| `vault-operations`                | `vo`                 |
| `contracts hub`                   | `contracts hub`      |
| `mint-shares`                     | `mint`               |
| `burn-shares`                     | `burn`               |
| `set-node-operator-fee-recipient` | `set-no-f-r`         |
| `change-tier`                     | `ct`                 |
| `change-tier-by-no`               | `ct-no`              |
| `sync-tier`                       | `st`                 |
| `connect-and-accept-tier`         | `connect-and-accept` |
| `by-vault-submit`                 | `submit`             |
| `latest-report-data`              | `lrd`                |
| `no-balance`                      | `no-bal`             |
| `pending-activations`             | `pd`                 |
| `prove-and-activate`              | `prove`              |
| `consolidate-validators`          | `consolidate`        |

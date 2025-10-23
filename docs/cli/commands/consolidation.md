---
sidebar_position: 8
---

# Consolidation

## Command

```bash
yarn start consolidation [arguments] [-options]
```

## Consolidation commands list

```bash
yarn start consolidation -h
```

## Overview

Consolidation commands handle validator migration and merging for Lido Staking Vaults. They enable moving funds from existing validators to new ones with vault withdrawal credentials using the EIP-7251 consolidation mechanism.

## API

| Command   | Description    |
| --------- | -------------- |
| write (w) | write commands |

### Read

Currently no read commands are implemented for consolidation.

### Write

| Command | Description                                                                                |
| ------- | ------------------------------------------------------------------------------------------ |
| -       | Consolidate validators and increase fee exemption to fix fee calculation for node-operator |

## Command Details

### write

Consolidates validators and increases fee exemption to fix fee calculation for node-operator.

**Usage:**

```bash
yarn start consolidation write <dashboard> [options]
```

**Arguments:**

- `<dashboard>` - Dashboard contract address

**Options:**

- `-s, --source_pubkeys <source_pubkeys>` - 2D array of source validator pubkeys: each inner list will be consolidated into a single target validator
- `-t, --target_pubkeys <target_pubkeys>` - List of target validator public keys to consolidate into. One target pubkey per group of source pubkeys
- `-f, --file <file>` - Path to a JSON file containing the source pubkeys and target pubkeys

**Examples:**

1. **Using command line options:**

```bash
yarn start consolidation write 0x1234...5678 \
  --source_pubkeys "0xabc... 0xdef...,0x111... 0x222..." \
  --target_pubkeys "0x999...,0x888..."
```

2. **Using JSON file:**

```bash
yarn start consolidation write 0x1234...5678 \
  --file ./consolidation-config.json
```

**JSON File Format:**
The JSON file should contain a mapping of target pubkeys to arrays of source pubkeys:

```json
{
  "target_pubkey_first": [
    "source_pubkey_first_group_01",
    "source_pubkey_first_group_02"
  ],
  "target_pubkey_second": [
    "source_pubkey_second_group_01",
    "source_pubkey_second_group_02"
  ]
}
```

**Requirements:**

- You must provide either `--file` or both `--source_pubkeys` and `--target_pubkeys`
- Source and target pubkeys arrays must have the same length
- All pubkeys must be valid validator public keys
- Dashboard address must be a valid non-zero address

**Process:**

1. Validates input parameters and validator states
2. Checks finality checkpoints and validator eligibility
3. Calculates consolidation fees using EIP-7251 predeploy contract
4. Generates consolidation request transactions
5. Creates fee exemption transaction if needed
6. Executes all transactions in batch

**Notes:**

- This command uses the EIP-7251 consolidation mechanism
- Consolidation requests are sent to the predeploy contract at `0x0000BBdDc7CE488642fb579F8B00f3a590007251`
- The process includes automatic fee calculation and fee exemption
- All transactions are executed atomically - either all succeed or all fail

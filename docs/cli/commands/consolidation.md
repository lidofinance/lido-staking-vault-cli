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
| read (r)  | read commands  |
| write (w) | write commands |

### Read

Currently no read commands are implemented for consolidation.

### Write

| Command                              | Description                                                                                     |
| ------------------------------------ | ----------------------------------------------------------------------------------------------- |
| consolidate-validators (consolidate) | Consolidate validators and increase rewards adjustment to fix fee calculation for node-operator |

## Command Details

### consolidate-validators (consolidate)

Consolidates validators and increases rewards adjustment to fix fee calculation for node-operator.

**Usage:**

```bash
yarn start consolidation write consolidate-validators <dashboard> [options]
```

Or using aliases:

```bash
yarn start consolidation w consolidate <dashboard> [options]
```

**Arguments:**

- `<dashboard>`: Dashboard contract address

**Options:**

- `-s, --source <source>`: 2D array of source validator pubkeys - each inner list will be consolidated into a single target validator
- `-t, --target <target>`: List of target validator public keys to consolidate into. One target pubkey per group of source pubkeys
- `-f, --file <file>`: Path to a JSON file containing the source pubkeys and target pubkeys
- `-b, --batch`: Batch the consolidation requests and increase fee exemption amount. Use this option if your wallet supports batching (default: false)

**Examples:**

1. **Using command line options:**

```bash
yarn start consolidation write consolidate-validators 0x1234...5678 \
  --source "0xabc... 0xdef...,0x111... 0x222..." \
  --target "0x999...,0x888..."
```

2. **Using JSON file:**

```bash
yarn start consolidation write consolidate-validators 0x1234...5678 \
  --file ./consolidation-config.json
```

3. **With batch mode (for wallets supporting batching):**

```bash
yarn start consolidation write consolidate-validators 0x1234...5678 \
  --file ./consolidation-config.json \
  --batch
```

4. **Using aliases (shorter form):**

```bash
yarn start consolidation w consolidate 0x1234...5678 \
  --file ./consolidation-config.json \
  --batch
```

**JSON File Format:**

The JSON file should contain a mapping of target pubkeys to arrays of source pubkeys:

```json
{
  "0x999...target_pubkey_first": [
    "0xabc...source_pubkey_first_group_01",
    "0xdef...source_pubkey_first_group_02"
  ],
  "0x888...target_pubkey_second": [
    "0x111...source_pubkey_second_group_01",
    "0x222...source_pubkey_second_group_02"
  ]
}
```

**Requirements:**

- You must provide either `--file` or both `--source` and `--target`
- Source and target pubkeys arrays must have the same length
- All pubkeys must be valid validator public keys (48 bytes hex strings with 0x prefix)
- Dashboard address must be a valid non-zero address
- All source validators must be active and eligible for consolidation
- Target validators must have vault withdrawal credentials

**Process:**

1. **Input Validation**: Validates dashboard address and pubkey format
2. **Validator Info Retrieval**: Fetches current state of all source and target validators
3. **Fee Calculation**: Calculates required rewards adjustment (fee exemption) based on consolidation
4. **Inactive Validator Filtering**: Removes any inactive validators from the consolidation list
5. **Confirmation Display**: Shows detailed tables of source and target validators
6. **Transaction Execution**:
   - **Without `--batch`**: Executes consolidation requests and fee exemption sequentially
   - **With `--batch`**: Bundles all operations into a single batch transaction

**Batch Mode:**

When using `--batch` flag:

- All consolidation requests and fee exemption are bundled into a single transaction
- Requires wallet support for batch/multicall operations (e.g., Safe, Gnosis)
- More gas efficient and atomic execution
- All operations succeed or fail together

Without `--batch` flag:

- Each consolidation request is sent as a separate transaction
- Fee exemption is sent as a separate transaction
- Suitable for standard wallets (MetaMask, WalletConnect)
- Allows for partial success if some transactions fail

**Notes:**

- This command uses the EIP-7251 consolidation mechanism
- Consolidation requests are sent to the predeploy contract at `0x0000BBdDc7CE488642fb579F8B00f3a590007251`
- The process includes automatic calculation and adjustment of rewards (fee exemption)
- Validators must meet consensus layer eligibility requirements for consolidation
- Inactive validators are automatically filtered out and will not be processed
- Consolidation is irreversible - ensure all parameters are correct before confirming

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
- `-b, --batch`: Batch the consolidation requests and increase fee exemption amount. **Requires `--wallet-connect` flag** (default: false)

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

3. **With batch mode (requires WalletConnect):**

```bash
yarn start consolidation write consolidate-validators 0x1234...5678 \
  --file ./consolidation-config.json \
  --batch \
  --wallet-connect
```

4. **Using aliases (shorter form):**

```bash
yarn start consolidation w consolidate 0x1234...5678 \
  --file ./consolidation-config.json \
  --batch \
  --wallet-connect
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

- **Role**: Caller must have `NODE_OPERATOR_FEE_EXEMPT_ROLE` on the dashboard contract
- **Fresh Report**: A fresh report must be submitted before consolidating validators
- **Input Format**: You must provide either `--file` or both `--source` and `--target`
- **Array Length**: Source and target pubkeys arrays must have the same length
- **Pubkey Format**: All pubkeys must be valid validator public keys (48 bytes hex strings with 0x prefix)
- **Dashboard Address**: Must be a valid non-zero address
- **Validator Status**: All source validators must be active and eligible for consolidation
- **Withdrawal Credentials**: Target validators must have vault withdrawal credentials
- **Batch Mode**: If using `--batch` flag, you **must** also use `--wallet-connect` flag

**Process:**

1. **Input Validation**: Validates dashboard address and pubkey format
2. **Role Verification**: Checks that caller has `NODE_OPERATOR_FEE_EXEMPT_ROLE`
3. **Report Freshness Check**: Validates that a fresh report has been submitted
4. **Validator Info Retrieval**: Fetches current state of all source and target validators
5. **Fee Calculation**: Calculates required rewards adjustment (fee exemption) based on consolidation
6. **Inactive Validator Filtering**: Automatically removes any inactive validators from the consolidation list
7. **Confirmation Display**: Shows detailed tables of source and target validators
8. **Transaction Execution**:
   - **Without `--batch`**: Executes consolidation requests and fee exemption sequentially
   - **With `--batch`**: Bundles all operations into a single batch transaction (requires WalletConnect)

**Batch Mode:**

When using `--batch` flag:

- **⚠️ REQUIRES**: Must be used with `--wallet-connect` flag, otherwise command will abort with error
- All consolidation requests and fee exemption are bundled into a single transaction
- Requires wallet support for batch/multicall operations (e.g., Safe and Smart Accounts via WalletConnect)
- More gas efficient and atomic execution
- All operations succeed or fail together
- Shows confirmation prompt with total number of operations to be executed

Without `--batch` flag:

- Each consolidation request is sent as a separate transaction
- Fee exemption is sent as a separate transaction
- Suitable for any wallet type (MetaMask, WalletConnect)
- Allows for partial success if some transactions fail
- Less gas efficient but more flexible

**Notes:**

- This command uses the EIP-7251 consolidation mechanism
- Consolidation requests are sent to the predeploy contract at `0x0000BBdDc7CE488642fb579F8B00f3a590007251`
- The process includes automatic calculation and adjustment of rewards (fee exemption)
- Validators must meet consensus layer eligibility requirements for consolidation
- Inactive validators are automatically filtered out and will not be processed
- Consolidation is irreversible - ensure all parameters are correct before confirming

## Error Handling

The command provides clear error messages for common scenarios:

**Role and Permission Errors:**

- ❌ **Missing NODE_OPERATOR_FEE_EXEMPT_ROLE**: Caller must have the required role on the dashboard contract
- ❌ **Batch without WalletConnect**: If `--batch` is used without `--wallet-connect`, command aborts with error message

**Validation Errors:**

- ❌ **Report not fresh**: Fresh report must be submitted before consolidating validators
- ❌ **Invalid input format**: Must provide either `--file` or both `--source` and `--target`
- ❌ **Mismatched array lengths**: Source and target pubkeys arrays must have the same length
- ❌ **Invalid pubkey format**: All pubkeys must be valid 48-byte hex strings with 0x prefix
- ❌ **Invalid dashboard address**: Dashboard address must be non-zero

**Validator Status Errors:**

- ⚠️ **Inactive validators**: Automatically filtered out with warning message
- ❌ **Invalid withdrawal credentials**: Target validators must have vault withdrawal credentials
- ❌ **Ineligible validators**: Source validators must meet consensus layer requirements for consolidation

**Transaction Errors:**

- ❌ **User cancellation**: Operation cancelled if user declines confirmation prompts
- ❌ **Transaction failure**: Clear error messages if on-chain transactions revert

## Best Practices

1. **Check Requirements First**: Verify you have `NODE_OPERATOR_FEE_EXEMPT_ROLE` before attempting consolidation
2. **Submit Fresh Report**: Always ensure a fresh report has been submitted to the vault
3. **Validate Input**: Double-check all pubkeys and the dashboard address before execution
4. **Use JSON File**: For multiple consolidations, using `--file` is cleaner and less error-prone than command-line arguments
5. **Review Tables**: Carefully review the source and target validator tables before confirming
6. **Batch Mode**: Use `--batch` with `--wallet-connect` for gas efficiency when consolidating multiple validators

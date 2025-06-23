---
sidebar_position: 5
---

# Reports

This guide covers vault reporting operations for Lido Staking Vaults. The CLI interacts with existing oracle reports stored on IPFS and submits them to the LazyOracle contract for on-chain processing.

## Overview

The reporting system works with oracle-generated reports through:

- **IPFS Storage**: Fetches existing reports from decentralized storage
- **LazyOracle**: Submits report data to on-chain oracle contract
- **Merkle Proofs**: Verifies individual vault data from batched reports

## Fetch Reports

### Get Latest Report Data

Retrieve metadata about the latest oracle report:

```bash
yarn start report r latest-report-data
```

**Returns:**

- Timestamp of the latest report
- Merkle tree root of all vault data
- IPFS CID containing the full report

### Get Report by Vault

Fetch specific vault data from the latest oracle report:

```bash
yarn start report r by-vault
```

**Options:**

- `-v, --vault <address>`: Vault address (interactive selection if not provided)
- `-g, --gateway <url>`: Custom IPFS gateway URL

**Returns vault data:**

- `vault_address`: The vault contract address
- `total_value_wei`: Total ETH value managed by vault (in wei)
- `fee`: Accumulated fees for the vault
- `liability_shares`: Total shares issued by vault
- `slashing_reserve`: Reserved amount for potential slashing

### Get Proof by Vault

Generate Merkle proof for a specific vault's data:

```bash
yarn start report r proof-by-vault
```

**Options:**

- `-v, --vault <address>`: Vault address (interactive selection if not provided)
- `-g, --gateway <url>`: Custom IPFS gateway URL

**Returns:**

- Merkle proof array for the vault's data
- Proof can be used for on-chain verification

### Get All Reports

Fetch complete report data for all vaults:

```bash
yarn start report r all
```

**Options:**

- `-g, --gateway <url>`: Custom IPFS gateway URL

**Returns:**

- Array of all vault reports in the latest oracle update
- Comprehensive overview of entire stVaults ecosystem

### Check CID

Verify IPFS accessibility of the latest report:

```bash
yarn start report r check-cid
```

**Options:**

- `-u, --url <url>`: Custom IPFS gateway to test

**Purpose:**

- Verifies report data is accessible via IPFS
- Useful for troubleshooting connectivity issues

## Submit Reports

### Submit by Vault

Submit existing oracle report data for a specific vault to LazyOracle:

```bash
yarn start report w by-vault-submit
```

**Options:**

- `-v, --vault <address>`: Vault address (interactive selection if not provided)
- `-g, --gateway <url>`: Custom IPFS gateway URL

**Process:**

1. Fetches latest report from IPFS
2. Generates Merkle proof for the vault
3. Displays vault data for confirmation
4. Submits `updateVaultData` transaction to LazyOracle

### Submit by Multiple Vaults

Batch submit reports for specific vaults:

```bash
yarn start report w by-vaults-submit <vault1> <vault2> [...]
```

**Arguments:**

- `<vaults...>`: Space-separated list of vault addresses

**Options:**

- `-g, --gateway <url>`: Custom IPFS gateway URL
- `-e, --skip-error`: Continue processing if individual submissions fail

**Benefits:**

- Processes multiple vaults efficiently
- Progress bar shows update status
- Can skip failures and continue

### Submit All

Submit reports for all vaults in the latest oracle update:

```bash
yarn start report w submit-all
```

**Options:**

- `-g, --gateway <url>`: Custom IPFS gateway URL
- `-e, --skip-error`: Continue processing if individual submissions fail

**Process:**

- Fetches all vault data from latest oracle report
- Updates every vault with progress tracking
- Provides complete ecosystem synchronization

## Report Data Structure

### Vault Data Fields

Each vault report contains five core fields:

| Field              | Description                             | Type   |
| ------------------ | --------------------------------------- | ------ |
| `vault_address`    | Vault contract address                  | String |
| `total_value_wei`  | Total ETH value in vault (wei)          | String |
| `fee`              | Accumulated fees                        | String |
| `liability_shares` | Total shares issued by vault            | String |
| `slashing_reserve` | Reserved amount for slashing protection | String |

### Report Metadata

Reports include additional metadata:

- **Timestamp**: When the report was generated
- **Block Number**: Ethereum block reference
- **Merkle Tree Root**: Root hash for data verification
- **Reference Slot**: Beacon Chain slot reference
- **Previous CID**: Link to previous report for history

## Use Cases

### Regular Monitoring

Check latest vault status:

```bash
# Check latest oracle data
yarn start report r latest-report-data

# Get specific vault details
yarn start report r by-vault
```

### Oracle Updates

Submit fresh oracle data to contracts:

```bash
# Update single vault
yarn start report w by-vault-submit

# Update multiple specific vaults
yarn start report w by-vaults-submit 0x123... 0x456...
```

### Health Monitoring Integration

Use reports with other commands:

```bash
# Update oracle data first
yarn start report w by-vault-submit

# Then check vault health with fresh data
yarn start vo r health

# Review performance metrics
yarn start metrics r statistic
```

## Error Handling

### IPFS Issues

**Connection Problems:**

- Try different IPFS gateway with `-g` option
- Verify network connectivity
- Check if CID exists using `check-cid` command

**Missing Data:**

- Vault not found in report indicates it's not tracked by oracle
- Wait for next oracle update if data is stale

### Transaction Failures

**Oracle Submission Errors:**

- Ensure sufficient gas for transaction
- Verify vault exists and is tracked
- Check if report data is valid and current

**Batch Operation Issues:**

- Use `--skip-error` to continue past individual failures
- Review which vaults failed and retry individually

## Best Practices

### Update Frequency

- Submit reports after oracle updates for accurate vault state
- Use `latest-report-data` to check for new oracle data
- Submit before performing vault operations that depend on fresh data

### Data Verification

```bash
# Always verify data before submission
yarn start report r by-vault

# Check proof validity
yarn start report r proof-by-vault

# Ensure IPFS accessibility
yarn start report r check-cid
```

## Integration with Other Commands

Reports provide critical data for other CLI operations:

```bash
# Complete vault monitoring workflow
yarn start report w by-vault-submit    # Update oracle data
yarn start vo r health                 # Check health with fresh data
yarn start vo r overview               # Review updated metrics
yarn start metrics r statistic        # Analyze performance
```

## Security Considerations

### Data Integrity

- Oracle reports are cryptographically verified via Merkle proofs
- IPFS provides content-addressed storage ensuring data integrity
- LazyOracle contract validates all submitted data

### Access Control

- Report submission is permissionless (anyone can update with valid proofs)
- Oracle data generation is controlled by authorized oracle operators
- All transactions are publicly auditable on-chain

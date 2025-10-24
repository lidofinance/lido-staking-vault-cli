---
sidebar_position: 5
---

# Report

## Command

```bash
yarn start report [arguments] [-options]
```

## Report commands list

```bash
yarn start report -h
```

## Overview

Report commands handle vault accounting reports and oracle data updates for Lido Staking Vaults. They work with the LazyOracle system to fetch, verify, and submit vault state updates stored on IPFS.

## API

| Command   | Description    |
| --------- | -------------- |
| read (r)  | read commands  |
| write (w) | write commands |

### Read

| Command                | Description                |
| ---------------------- | -------------------------- |
| latest-report-data lrd | get the latest report data |
| by-vault               | get report by vault        |
| proof-by-vault         | get proof by vault         |
| all                    | get all reports            |
| check-cid              | check ipfs CID             |

### Write

| Command                    | Description                  |
| -------------------------- | ---------------------------- |
| by-vault-submit submit     | submit report by vault       |
| by-vaults-submit \<vaults> | submit report for vaults     |
| submit-all                 | submit report for all vaults |

## Command Details

### latest-report-data (lrd)

Retrieves the latest oracle report metadata from the LazyOracle contract.

**Returns:**

- Timestamp of the latest report
- Merkle tree root of vault data
- IPFS CID containing the report data

**Use Case:** Check when the last oracle update occurred and get the CID for fetching detailed vault reports.

### by-vault

Fetches a detailed report for a specific vault from IPFS data.

**Options:**

- `-v, --vault <address>`: Specify vault address
- `-g, --gateway <url>`: Custom IPFS gateway URL

**Process:**

- Retrieves latest report CID from LazyOracle
- Fetches and verifies IPFS data
- Extracts vault-specific report data
- Returns vault metrics (total value, fees, liability shares, etc.)

### proof-by-vault

Generates a Merkle proof for a specific vault's data in the report tree.

**Options:**

- `-v, --vault <address>`: Specify vault address
- `-g, --gateway <url>`: Custom IPFS gateway URL

**Process:**

- Fetches the report data from IPFS
- Constructs Merkle tree from all vault data
- Generates cryptographic proof for the specified vault
- Returns proof array that can be used for on-chain verification

**Use Case:** Generate proofs needed for submitting vault updates to the LazyOracle contract.

### all

Retrieves reports for all vaults in the latest oracle report.

**Options:**

- `-g, --gateway <url>`: Custom IPFS gateway URL

**Process:**

- Fetches complete report data from IPFS
- Parses all vault entries in the report
- Returns comprehensive data for all tracked vaults

**Use Case:** Get overview of entire stVaults ecosystem state.

### check-cid

Verifies that the latest report CID is accessible via IPFS.

**Options:**

- `-u, --url <url>`: Custom IPFS gateway URL to test

**Process:**

- Gets latest report CID from LazyOracle
- Attempts to fetch and verify the file from IPFS
- Validates file integrity and accessibility

**Use Case:** Troubleshoot IPFS connectivity issues or verify report availability.

### by-vault-submit (submit)

Submits an oracle report update for a specific vault to the LazyOracle contract.

**Options:**

- `-v, --vault <address>`: Specify vault address
- `-g, --gateway <url>`: Custom IPFS gateway URL

**Process:**

- Fetches latest report data and generates Merkle proof
- Displays vault metrics for confirmation
- Submits updateVaultData transaction to LazyOracle
- Updates on-chain vault state with latest oracle data

**Requirements:**

- Vault must exist in the latest oracle report
- Caller must have sufficient gas for transaction

### by-vaults-submit

Batch submits oracle reports for multiple specified vaults.

**Arguments:**

- `<vaults...>`: Array of vault addresses to update

**Options:**

- `-g, --gateway <url>`: Custom IPFS gateway URL
- `-e, --skip-error`: Continue processing even if individual vault updates fail

**Process:**

- Generates proofs for all specified vaults
- Updates each vault sequentially with progress bar
- Can skip failed transactions and continue with remaining vaults

**Use Case:** Efficiently update multiple vaults in a single CLI operation.

### submit-all

Submits oracle reports for all vaults in the latest report.

**Options:**

- `-g, --gateway <url>`: Custom IPFS gateway URL
- `-e, --skip-error`: Continue processing even if individual vault updates fail

**Process:**

- Fetches all vault data from latest oracle report
- Generates proofs for every vault in the system
- Submits updates for all vaults with progress tracking
- Provides comprehensive ecosystem-wide oracle update

**Use Case:** Perform complete oracle synchronization for entire stVaults system.

## Oracle Integration

All report commands integrate with the **LazyOracle** system:

- **IPFS Storage**: Reports are stored on IPFS for decentralized access
- **Merkle Trees**: Vault data is organized in Merkle trees for efficient verification
- **Lazy Updates**: Individual vaults can be updated permissionlessly using proofs
- **Data Integrity**: All IPFS content is verified before processing

## Error Handling

The system includes error handling for:

- **IPFS Connectivity**: Failed fetches from IPFS gateways
- **Missing Vault Data**: Vaults not found in oracle reports
- **Invalid Proofs**: Corrupted or invalid Merkle proofs
- **Transaction Errors**: Failed on-chain updates
- **Network Issues**: Connection problems with Ethereum node

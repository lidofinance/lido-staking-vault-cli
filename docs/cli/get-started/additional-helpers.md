---
sidebar_position: 6
---

# Additional Helpers

This guide covers helpful utility commands for working with Lido Staking Vaults. These dashboard-related commands provide essential information for vault monitoring, analysis, and administrative operations.

## Overview

Dashboard helper commands provide quick access to:

- **Vault-Dashboard Relationships**: Find associated contracts
- **Configuration Data**: Retrieve contract constants and settings
- **Role Management**: Check permissions and access control
- **Performance Overview**: Monitor vault metrics and health

All commands are read-only operations that don't require transaction signing.

## Dashboard Discovery

### Find Dashboard by Vault

Retrieve the Dashboard contract address associated with a specific vault:

```bash
yarn start contracts dashboard r dashboard-address-by-vault <vault_address>
```

**Use Case**: When you have a vault address but need to interact with its Dashboard contract for minting, burning, or administrative operations.

### Arguments

| Argument          | Description                   | Format |
| ----------------- | ----------------------------- | ------ |
| `<vault_address>` | StakingVault contract address | 0x...  |

### Example

```bash
# Find dashboard for a specific vault
yarn start contracts dashboard r dashboard-address-by-vault 0x1234567890123456789012345678901234567890
```

**Output**: Returns the Dashboard contract address associated with the vault.

## stVault Information

### Get stVault Constants

Retrieve basic configuration information and constants from a Dashboard contract:

```bash
yarn start vo r info
```

**Information Includes**:

- Contract addresses (StakingVault, VaultHub, etc.)
- Configuration parameters (fees, limits, etc.)
- Constants

**Options:**

- `-v, --vault <address>`: Vault address (interactive selection if not provided)

### Example

```bash
# Get dashboard configuration info
yarn start vo r info -v 0xabcdefabcdefabcdefabcdefabcdefabcdefabcd
```

## Role Management

### Check stVault Roles

View all role assignments for a stVault (and Dashboard) contract:

```bash
yarn start vo r roles
```

**Role Information**:

- Admin roles and addresses
- Mint/burn permissions
- Operational roles

**Options:**

- `-v, --vault <address>`: Vault address (interactive selection if not provided)

### Example

```bash
# Check roles for dashboard
yarn start vo r roles -v 0xabcdefabcdefabcdefabcdefabcdefabcdefabcd
```

**Output**:

- `DEFAULT_ADMIN_ROLE`: Administrative control
- `MINT_ROLE`: Token minting permissions
- `BURN_ROLE`: Token burning permissions
- Other roles and their holders

## stVault Overview

### Get Comprehensive Overview

Retrieve detailed metrics and status information for a stVault:

```bash
yarn start vo r overview
```

**Overview Includes**:

- Health factor and utilization ratio
- Reserve and fee rate information
- Available withdrawal capacity
- Collateral and locked funds breakdown
- Minting capacity (total and remaining)
- Visual health and liability bars

**Options:**

- `-v, --vault <address>`: Vault address (interactive selection if not provided)

### Example

```bash
# Get complete dashboard overview
yarn start vo r overview -v 0xabcdefabcdefabcdefabcdefabcdefabcdefabcd
```

## Troubleshooting

### Common Issues

**Dashboard Not Found**

```bash
# Verify vault address
yarn start vo r info

# Check vault-dashboard connection
yarn start contracts dashboard r dashboard-address-by-vault <vault_address>
```

**Permission Errors**

```bash
# Check your account permissions
yarn start account r info

# Verify dashboard roles
yarn start vo r roles
```

**Stale Data**

```bash
# Refresh with latest data
yarn start vo r overview

# Compare with vault health
yarn start vo r health
```

### Performance Issues

**Slow Responses**

- Check RPC endpoint connectivity
- Verify contract address validity
- Consider network congestion effects

---
sidebar_position: 2
---

# Creating a Vault

This guide walks you through creating new Lido Staking Vaults using the CLI. Staking Vaults are isolated smart contracts that enable customized staking configurations with role-based access control.

## Overview

Vault creation deploys two main contracts:

- **StakingVault**: Core vault contract
- **Dashboard**: Management interface providing metrics, minting/burning, administrative functions etc

## Basic Vault Creation

### Create Connected Vault

Creates a vault and automatically connects it to the VaultHub:

```bash
yarn start vo w create-vault create
```

### Create Standalone Vault

Creates a vault without VaultHub connection:

```bash
yarn start vo w create-vault create-without-connecting
```

## Command Reference

### Arguments

| Argument     | Description                | Default |
| ------------ | -------------------------- | ------- |
| `[quantity]` | Number of vaults to create | 1       |

### Required Options

| Option                                  | Description                   | Example    |
| --------------------------------------- | ----------------------------- | ---------- |
| `-da, --defaultAdmin <address>`         | Default admin address         | `0x123...` |
| `-no, --nodeOperator <address>`         | Node operator address         | `0x456...` |
| `-nom, --nodeOperatorManager <address>` | Node operator manager address | `0x789...` |

### Configuration Options

| Option                                 | Description                         | Range/Format           |
| -------------------------------------- | ----------------------------------- | ---------------------- |
| `-ce, --confirmExpiry <number>`        | Confirmation expiry time in seconds | Min-Max range enforced |
| `-nof, --nodeOperatorFeeRate <number>` | Node operator fee rate              | 100 = 1%               |

### Advanced Options

| Option               | Description                 | Format     |
| -------------------- | --------------------------- | ---------- |
| `-r, --roles <json>` | Additional role assignments | JSON array |

## Role Assignment Format

When using the `-r, --roles` option, provide a JSON array of role assignments:

```json
[
  {
    "account": "0x1234567890123456789012345678901234567890",
    "role": "0x0000000000000000000000000000000000000000000000000000000000000000"
  },
  {
    "account": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    "role": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
  }
]
```

### Common Role Constants

| Role                 | Description            | Hex Value         |
| -------------------- | ---------------------- | ----------------- |
| `DEFAULT_ADMIN_ROLE` | Administrative control | `0x00...00`       |
| `FUND_ROLE`          | Can add ETH to vault   | Contract-specific |
| `WITHDRAW_ROLE`      | Can withdraw ETH       | Contract-specific |
| `MINT_ROLE`          | Can mint stETH tokens  | Contract-specific |
| `BURN_ROLE`          | Can burn stETH tokens  | Contract-specific |

## Step-by-Step Example

### 1. Prepare Addresses

Before creating a vault, ensure you have:

```bash
# Check your account
yarn start account r info

# Verify you have sufficient ETH for gas
# Typical gas cost: 0.01-0.05 ETH
```

### 2. Create Basic Vault

```bash
yarn start vo w create-vault create \
  --defaultAdmin 0x1234567890123456789012345678901234567890 \
  --nodeOperator 0xabcdefabcdefabcdefabcdefabcdefabcdefabcd \
  --nodeOperatorManager 0x9876543210987654321098765432109876543210 \
  --confirmExpiry 3600 \
  --nodeOperatorFeeRate 100
```

or interactive way

```bash
yarn start vo w create-vault create
```

### 3. Create Multiple Vaults

```bash
yarn start vo w create-vault create 3 \
  --defaultAdmin 0x1234567890123456789012345678901234567890 \
  --nodeOperator 0xabcdefabcdefabcdefabcdefabcdefabcdefabcd \
  --nodeOperatorManager 0x9876543210987654321098765432109876543210 \
  --confirmExpiry 3600 \
  --nodeOperatorFeeRate 500
```

### 4. Create Vault with Custom Roles

```bash
yarn start vo w create-vault create \
  --defaultAdmin 0x1234567890123456789012345678901234567890 \
  --nodeOperator 0xabcdefabcdefabcdefabcdefabcdefabcdefabcd \
  --nodeOperatorManager 0x9876543210987654321098765432109876543210 \
  --confirmExpiry 3600 \
  --nodeOperatorFeeRate 500 \
  --roles '[{
    "account": "0xfeedbeeffeedbeeffeedbeeffeedbeeffeedbeef",
    "role": "0x0000000000000000000000000000000000000000000000000000000000000000"
  }]'
```

## Process Flow

The vault creation process follows these steps:

### 1. Parameter Validation

- Validates all provided addresses
- Checks confirm expiry range
- Verifies node operator fee rate bounds
- Parses and validates role assignments

### 2. Configuration Display

- Shows all vault parameters for review
- Displays estimated gas costs
- Lists role assignments and permissions

### 3. User Confirmation

- Prompts for final confirmation
- Allows cancellation before deployment
- Shows transaction details preview

### 4. Contract Deployment

- Deploys StakingVault contract
- Deploys Dashboard contract
- Sets up initial roles and permissions
- Connects to VaultHub (if applicable)

### 5. Result Display

- Shows deployed contract addresses
- Provides transaction hash and block number
- Displays owner address
- Logs all assigned roles

## Return Values

After successful creation, the CLI returns:

```
Vault Address: 0x1234567890123456789012345678901234567890
Dashboard Address: 0xabcdefabcdefabcdefabcdefabcdefabcdefabcd
Owner Address: 0x9876543210987654321098765432109876543210
Transaction Hash: 0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321
Block Number: 18500000
```

## Configuration Parameters

### Default Admin

- **Purpose**: Ultimate administrative control over the vault
- **Responsibilities**: Can grant/revoke roles, change critical parameters

### Node Operator

- **Purpose**: Manages validator operations and deposits
- **Responsibilities**: Can perform predeposits, validator proving, deposits

### Node Operator Manager

- **Purpose**: Manages node operator permissions and settings
- **Responsibilities**: Can update node operator configurations
- **Use Case**: Often same as node operator or delegated manager

### Confirm Expiry

- **Purpose**: Time limit for confirming transactions
- **Range**: Enforced minimum and maximum values
- **Security**: Prevents indefinite pending operations

### Node Operator Fee Rate

- **Purpose**: Percentage of rewards allocated to node operator
- **Format**: Basis points (100 = 1%)
- **Range**: Typically 0-1000 (0-10%)

## Security Considerations

### Address Verification

- **Double-check all addresses** before deployment
- **Verify control** of provided addresses

### Role Assignment

- **Principle of least privilege**: Only assign necessary roles

## Troubleshooting

### Common Issues

**Insufficient Gas**

```bash
# Check account balance
yarn start account r info

# Ensure sufficient ETH for deployment
```

**Invalid Address Format**

```bash
# Verify address format (0x + 40 hex characters)
# Use address validation tools
```

**Role Assignment Errors**

```bash
# Validate JSON format
# Check role constant values
# Verify account addresses in role assignments
```

**Network Connectivity**

```bash
# Test RPC endpoint
# Verify CHAIN_ID configuration
# Check for rate limiting
```

### Failed Deployment Recovery

If deployment fails:

1. **Check transaction status** using the provided hash
2. **Verify gas limit** wasn't exceeded
3. **Review error messages** for specific issues
4. **Retry with adjusted parameters** if needed

### Post-Creation Verification

After creation, verify the vault:

```bash
# Check vault info
yarn start vo r info

# Verify roles
yarn start vo r roles

# Test basic operations
yarn start vo r health
```

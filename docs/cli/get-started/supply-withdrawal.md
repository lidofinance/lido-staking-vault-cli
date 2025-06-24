---
sidebar_position: 3
---

# Supply (Fund) and Withdrawal

This guide covers funding your Lido Staking Vault with ETH and withdrawing funds when needed. These operations provide the essential liquidity management for vault operations.

## Overview

Vault funding and withdrawal operations work through the Dashboard contract:

- **Fund**: Add ETH to increase vault liquidity for validator deposits
- **Withdraw**: Remove ETH from vault (requires fresh report checks)

## Fund Vault

### Basic Funding

Add ETH to your vault to provide liquidity for validator operations:

```bash
yarn start vo w fund <amount>
```

### Dashboard Funding (Alternative)

You can also fund through the Dashboard contract directly:

```bash
yarn start contracts dashboard w fund <dashboard_address> <amount>
```

### Arguments and Options

| Command            | Argument/Option         | Description                                 | Format              |
| ------------------ | ----------------------- | ------------------------------------------- | ------------------- |
| `vo w fund`        | `<amount>`              | Amount of ETH to deposit                    | Decimal (e.g., 1.5) |
|                    | `-v, --vault <address>` | Vault address (interactive if not provided) | 0x...               |
| `dashboard w fund` | `<dashboard_address>`   | Dashboard contract address                  | 0x...               |
|                    | `<amount>`              | Amount of ETH to deposit                    | Decimal (e.g., 1.5) |

### Examples

```bash
# Fund vault with 32 ETH (enough for one validator)
yarn start vo w fund 32 -v 0x1234567890123456789012345678901234567890

# Fund vault with interactive selection
yarn start vo w fund 32

# Fund via dashboard contract
yarn start contracts dashboard w fund 0xabcdefabcdefabcdefabcdefabcdefabcdefabcd 1.5
```

## Withdraw from Vault

### Basic Withdrawal

Remove ETH from your vault to a specified recipient:

```bash
yarn start vo w withdraw <amount>
```

### Dashboard Withdrawal (Alternative)

You can also withdraw through the Dashboard contract:

```bash
yarn start contracts dashboard w withdraw <dashboard_address> <recipient_address> <amount>
```

### Arguments and Options

| Command                | Argument/Option             | Description                                     | Format              |
| ---------------------- | --------------------------- | ----------------------------------------------- | ------------------- |
| `vo w withdraw`        | `<amount>`                  | Amount of ETH to withdraw                       | Decimal (e.g., 5.0) |
|                        | `-v, --vault <address>`     | Vault address (interactive if not provided)     | 0x...               |
|                        | `-r, --recipient <address>` | Recipient address (interactive if not provided) | 0x...               |
| `dashboard w withdraw` | `<dashboard_address>`       | Dashboard contract address                      | 0x...               |
|                        | `<recipient_address>`       | Where to send withdrawn ETH                     | 0x...               |
|                        | `<amount>`                  | Amount of ETH to withdraw                       | Decimal (e.g., 5.0) |

### Examples

```bash
# Withdraw 5 ETH with interactive selection
yarn start vo w withdraw 5

# Withdraw with specified vault and recipient
yarn start vo w withdraw 5 \
  -v 0x1234567890123456789012345678901234567890 \
  -r 0x9876543210987654321098765432109876543210

# Withdraw using dashboard contract
yarn start contracts dashboard w withdraw \
  0xabcdefabcdefabcdefabcdefabcdefabcdefabcd \
  0x9876543210987654321098765432109876543210 \
  5
```

## Fund Operation Details

### Process Flow

1. **Permission Check**: Verifies caller has FUND_ROLE
2. **Amount Validation**: Ensures amount is positive and within limits
3. **Balance Verification**: Checks wallet has sufficient ETH
4. **Transaction Execution**: Transfers ETH to vault contract
5. **Event Emission**: Logs funding event for tracking

### Requirements

- **Role Permission**: Must have FUND_ROLE on the vault
- **Sufficient Balance**: Wallet must have ETH + gas fees
- **Valid Amount**: Must be greater than 0
- **Active Vault**: Vault must not be paused

## Withdrawal Operation Details

### Process Flow

1. **Permission Check**: Verifies caller has WITHDRAW_ROLE
2. **Health Check**: Validates vault health with fresh report
3. **Amount Validation**: Ensures sufficient available balance
4. **Recipient Validation**: Verifies recipient address
5. **Transaction Execution**: Transfers ETH to recipient
6. **Event Emission**: Logs withdrawal for tracking

### Requirements

- **Role Permission**: Must have WITHDRAW_ROLE on the vault
- **Fresh Health Data**: Vault report must be recent
- **Valid Recipient**: Cannot withdraw to zero address

## Access Control

### Required Roles

**For Funding (FUND_ROLE)**

- Vault owner by default
- Additional addresses as granted
- Can be revoked if needed

**For Withdrawal (WITHDRAW_ROLE)**

- Vault owner by default
- More restrictive than funding
- Requires explicit grants

### Role Management

```bash
# Check current roles
yarn start vo r roles

# Grant funding role (requires admin)
# Use appropriate contract management commands
```

## Troubleshooting

### Common Funding Issues

**Insufficient ETH Balance**

```bash
# Check account balance
yarn start account r info

# Ensure sufficient ETH for amount + gas
```

**Permission Denied**

```bash
# Verify roles
yarn start vo r roles

# Check if vault is paused
yarn start vo r info
```

### Common Withdrawal Issues

**Vault Health Check Failed**

```bash
# Update vault reports
yarn start report w by-vault-submit

# Check health after update
yarn start vo r health
```

**Insufficient Available Balance**

```bash
# Check vault overview
yarn start vo r overview

# Account for bonded validator ETH
# Consider pending deposits
```

**Stale Health Data**

```bash
# Submit fresh report
yarn start report w by-vault-submit

# Wait for confirmation before retrying withdrawal
```

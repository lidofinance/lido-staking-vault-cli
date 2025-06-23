---
sidebar_position: 4
---

# Mint and Burn Tokens

This guide covers minting and burning stETH-based tokens in Lido Staking Vaults.

## Overview

Vaults support three token formats for minting and burning:

- **Shares**: Native vault shares representing ownership
- **stETH**: Lido's liquid staking token
- **wstETH**: Wrapped stETH with static balance

All operations require appropriate role permissions.

## Mint Operations

### Mint Shares

Mint native vault shares directly:

```bash
yarn start vo w mint <amount>
```

### Mint stETH

Mint stETH tokens (rebasing):

```bash
yarn start vo w mint-steth <amount>
```

### Mint wstETH

Mint wrapped stETH tokens (non-rebasing):

```bash
yarn start vo w mint-wsteth <amount>
```

**Options for all mint commands:**

- `-v, --vault <address>`: Vault address (interactive selection if not provided)
- `-r, --recipient <address>`: Recipient address (interactive selection if not provided)

## Burn Operations

### Burn Shares

Burn vault shares:

```bash
yarn start vo w burn <amount>
```

### Burn stETH

Burn stETH tokens:

```bash
yarn start vo w burn-steth <amount>
```

### Burn wstETH

Burn wrapped stETH tokens:

```bash
yarn start vo w burn-wsteth <amount>
```

**Options for all burn commands:**

- `-v, --vault <address>`: Vault address (interactive selection if not provided)

## Examples

**Mint Operations**

```bash
# Mint 1 share with interactive selection
yarn start vo w mint 1

# Mint 32 stETH with specified vault and recipient
yarn start vo w mint-steth 32 \
  -v 0x1234567890123456789012345678901234567890 \
  -r 0x9876543210987654321098765432109876543210

# Mint 1 wstETH with interactive selection
yarn start vo w mint-wsteth 1
```

**Burn Operations**

```bash
# Burn 0.5 shares with interactive vault selection
yarn start vo w burn 0.5

# Burn 10 stETH from specific vault
yarn start vo w burn-steth 10 -v 0x1234567890123456789012345678901234567890

# Burn 1 wstETH with interactive selection
yarn start vo w burn-wsteth 1
```

## Alternative: Dashboard Direct Commands

You can also use dashboard commands directly:

**Mint via Dashboard:**

```bash
# Mint shares
yarn start contracts dashboard w mint-shares <dashboard_address> <recipient> <amount>

# Mint stETH
yarn start contracts dashboard w mint-steth <dashboard_address> <recipient> <amount>

# Mint wstETH
yarn start contracts dashboard w mint-wsteth <dashboard_address> <recipient> <amount>
```

**Burn via Dashboard:**

```bash
# Burn shares
yarn start contracts dashboard w burn-shares <dashboard_address> <amount>

# Burn stETH
yarn start contracts dashboard w burn-steth <dashboard_address> <amount>

# Burn wstETH
yarn start contracts dashboard w burn-wsteth <dashboard_address> <amount>
```

## Mint Operation Details

### Process Flow

1. **Permission Check**: Verifies caller has MINT_ROLE
2. **Health Check**: Validates vault health with fresh data
3. **Capacity Check**: Ensures sufficient minting capacity
4. **Amount Validation**: Confirms positive amount
5. **Transaction Execution**: Mints tokens to recipient
6. **Health Verification**: Ensures vault remains healthy

### Requirements

**For Minting:**

- **MINT_ROLE**: Required permission on Dashboard
- **Fresh Health Data**: Vault report must be recent
- **Minting Capacity**: Vault must have available capacity
- **Valid Recipient**: Cannot mint to zero address
- **Positive Amount**: Must specify amount > 0

### Security Features

**Health Validation**

- Prevents minting when vault is unhealthy
- Requires fresh oracle data
- Validates post-mint health

**Role-Based Access**

- Only authorized addresses can mint
- Granular permission control

**Capacity Limits**

- Prevents over-minting beyond vault collateral
- Maintains required reserve ratios

## Burn Operation Details

### Process Flow

1. **Permission Check**: Verifies caller has BURN_ROLE
2. **Balance Verification**: Checks caller has sufficient tokens
3. **Approval Check**: Validates token approvals to Dashboard
4. **Amount Validation**: Ensures valid burn amount
5. **Transaction Execution**: Burns tokens from caller
6. **Liability Update**: Reduces vault liability

### Requirements

**For Burning:**

- **BURN_ROLE**: Required permission on Dashboard
- **Token Balance**: Must own tokens being burned
- **Token Approval**: Must approve Dashboard to spend tokens
- **Valid Amount**: Must specify amount > 0 and ≤ balance

### Token Approvals

Before burning, ensure proper token approvals:

```bash
# Check your token balances and approvals
yarn start account r info

# Approve stETH to Dashboard contract before burning
# (Done via external wallet/contract interaction)
```

## Access Control

### Required Roles

**MINT_ROLE**

**BURN_ROLE**

### Role Management

```bash
# Check roles on vault
yarn start vo r roles

# Verify your account permissions
yarn start account r info
```

## Troubleshooting

### Common Minting Issues

**Permission Denied**

```bash
# Check roles
yarn start vo r roles

# Verify caller account
yarn start account r info
```

**Vault Health Failure**

```bash
# Update vault reports
yarn start report w by-vault-submit

# Check health after update
yarn start vo r health
```

**Insufficient Minting Capacity**

```bash
# Check vault overview
yarn start vo r overview

# Fund vault if needed
yarn start vo w fund <amount>
```

### Common Burning Issues

**Insufficient Balance**

```bash
# Check token balances
yarn start account r info

# Verify you own enough tokens to burn
```

**Missing Approvals**

```bash
# Ensure stETH is approved to Dashboard contract
# Check approval amounts
# Use wallet to approve if needed
```

**Invalid Amount**

```bash
# Ensure amount > 0
# Verify amount ≤ balance
# Use correct decimal precision
```

## Integration with Other Commands

**Complete Vault Workflow Example**

```bash
# 1. Check vault health
yarn start vo r health

# 2. Fund vault if needed
yarn start vo w fund 64

# 3. Mint tokens
yarn start vo w mint-steth 32

# 4. Monitor performance
yarn start vo r overview

# 5. Burn tokens if needed
yarn start vo w burn-steth 10
```

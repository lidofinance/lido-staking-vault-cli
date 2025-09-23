---
sidebar_position: 2
---

# Vault Operations

## Command

```bash
yarn start vo [arguments] [-options]
```

## Vault Operations commands list

```bash
yarn start vo -h
```

## Overview

Vault Operations commands manage the core functionality of Lido Staking Vaults including funding, withdrawals, minting/burning stETH tokens, and monitoring vault health and metrics.

## API

| Command   | Description    |
| --------- | -------------- |
| read (r)  | read commands  |
| write (w) | write commands |

### Read

| Command  | Description        |
| -------- | ------------------ |
| info     | get vault info     |
| health   | get vault health   |
| overview | get vault overview |
| roles    | get vault roles    |

### Write

| Command                                    | Description                                                                                                             |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| fund \<ether>                              | fund vaults                                                                                                             |
| withdraw \<eth>                            | withdraws ether from the staking vault to a recipient                                                                   |
| mint-shares mint\<amountOfShares>          | mints stETH tokens backed by the vault to a recipient                                                                   |
| mint-wsteth \<amountOfWsteth>              | mints wstETH tokens backed by the vault to a recipient                                                                  |
| mint-steth \<amountOfSteth>                | mints stETH tokens backed by the vault to a recipient                                                                   |
| burn-shares burn\<amountOfShares>          | Burns stETH shares from the sender backed by the vault. Expects corresponding amount of stETH approved to this contract |
| burn-steth \<amountOfShares>               | Burns stETH shares from the sender backed by the vault. Expects stETH amount approved to this contract.                 |
| burn-wsteth \<amountOfWsteth>              | Burns wstETH tokens from the sender backed by the vault. Expects wstETH amount approved to this contract.               |
| disburse-node-operator-fee                 | transfers the node operator's accrued fee to nodeOperatorFeeRecipient                                                   |
| set-node-operator-fee-recipient set-no-f-r | sets the node operator fee recipient address                                                                            |
| change-tier-by-no ct-no \<tierId>          | vault tier change by node operator with multi-role confirmation                                                         |
| change-tier ct \<tierId>                   | vault tier change by VAULT_CONFIGURATION_ROLE role with multi-role confirmation                                         |
| sync-tier st                               | requests a sync of tier on the OperatorGrid with multi-role confirmation                                                |
| create-vault                               | creates a new StakingVault and Dashboard contracts                                                                      |

## Command Details

### create-vault

Creates new StakingVault and Dashboard contracts with specified configuration.

**Sub-commands:**

- `create`: Creates vault and connects to VaultHub
- `create-without-connecting`: Creates vault without VaultHub connection

**Options:**

- `-da, --defaultAdmin <address>`: Default admin address
- `-no, --nodeOperator <address>`: Node operator address
- `-nom, --nodeOperatorManager <address>`: Node operator manager address
- `-ce, --confirmExpiry <number>`: Confirmation expiry time
- `-nof, --nodeOperatorFeeRate <number>`: Node operator fee rate (e.g., 100 = 1%)
- `-r, --roles <json>`: Additional role assignments

**Arguments:**

- `[quantity]`: Number of vaults to create (default: 1)

**Process:**

- Validates all addresses and parameters
- Displays creation confirmation with all settings
- Deploys new StakingVault and Dashboard contracts
- Assigns specified roles and permissions
- Optionally connects to VaultHub

**Returns:**

- Vault contract address
- Dashboard contract address
- Transaction hash and block number

### info

Displays comprehensive information about a StakingVault through its Dashboard contract.

**Options:**

- `-v, --vault <address>`: Specify vault address

**Information Displayed:**

- Contract addresses (vault, dashboard, VaultHub, Lido Locator)
- Fee configuration (reserve ratio, rebalance threshold, infrastructure fees)
- Vault metrics (total value, locked funds, liability shares)
- Minting capacity and limits
- Node operator settings and fee rates

**Use Case:** Get complete technical overview of vault configuration and current state.

### health

Checks and displays the health status of a StakingVault.

**Options:**

- `-v, --vault <address>`: Specify vault address

**Health Metrics:**

- Health ratio percentage
- Healthy/unhealthy status
- Total value in ETH
- Liability shares in stETH
- Force rebalance threshold

**Use Case:** Monitor vault health status and determine if maintenance actions are needed.

### overview

Provides a comprehensive dashboard view of vault performance and status with visual indicators.

**Options:**

- `-v, --vault <address>`: Specify vault address

**Overview Includes:**

- Health factor and utilization ratio
- Reserve and fee rate information
- Available withdrawal capacity
- Collateral and locked funds breakdown
- Minting capacity (total and remaining)
- Visual health and liability bars

**Use Case:** Get complete operational overview for vault management decisions.

### roles

Displays role assignments and permissions for the vault.

**Options:**

- `-v, --vault <address>`: Specify vault address

**Role Information:**

- Admin roles and permissions
- Node operator assignments
- Fund, mint, burn, and withdraw role holders

**Use Case:** Audit access control and permission structure.

### fund

Adds ETH to a StakingVault to increase its total value and collateral.

**Arguments:**

- `<ether>`: Amount of ETH to fund the vault

**Options:**

- `-v, --vault <address>`: Specify vault address

**Process:**

- Verifies caller has FUND_ROLE permission
- Displays funding confirmation with amount and vault address
- Transfers ETH directly to the vault contract

**Requirements:**

- Caller must have FUND_ROLE for the vault
- Sufficient ETH balance for funding

### withdraw

Withdraws ETH from a StakingVault to a specified recipient.

**Arguments:**

- `<eth>`: Amount of ETH to withdraw

**Options:**

- `-v, --vault <address>`: Specify vault address
- `-r, --recipient <address>`: Address to receive withdrawn ETH

**Process:**

- Verifies caller has WITHDRAW_ROLE permission
- Checks that vault report is fresh (submits update if needed)
- Displays withdrawal confirmation
- Transfers ETH from vault to recipient

**Requirements:**

- Caller must have WITHDRAW_ROLE for the vault
- Vault must have sufficient withdrawable balance
- Oracle report must be fresh

### mint-shares (mint)

Mints stETH shares backed by the vault's collateral to a recipient.

**Arguments:**

- `<amountOfShares>`: Amount of stETH shares to mint

**Options:**

- `-v, --vault <address>`: Specify vault address
- `-r, --recipient <address>`: Address to receive minted shares

**Process:**

- Verifies caller has MINT_ROLE permission
- Checks vault report freshness and minting capacity
- Calculates impact on vault health
- Displays minting confirmation with health projections
- Mints stETH shares to recipient

**Requirements:**

- Caller must have MINT_ROLE for the vault
- Sufficient minting capacity available
- Vault must remain healthy after minting

### mint-wsteth

Mints wstETH tokens (wrapped stETH) backed by the vault to a recipient.

**Arguments:**

- `<amountOfWsteth>`: Amount of wstETH to mint

**Options:**

- `-v, --vault <address>`: Specify vault address
- `-r, --recipient <address>`: Address to receive wstETH

**Process:**

- Verifies MINT_ROLE permission
- Follows same health and capacity checks as mint-shares
- Mints wstETH tokens to recipient

### mint-steth

Mints stETH tokens (by amount, not shares) backed by the vault to a recipient.

**Arguments:**

- `<amountOfSteth>`: Amount of stETH tokens to mint

**Options:**

- `-v, --vault <address>`: Specify vault address
- `-r, --recipient <address>`: Address to receive stETH

**Process:**

- Verifies MINT_ROLE permission
- Performs health and capacity validations
- Mints stETH tokens to recipient

### burn-shares (burn)

Burns stETH shares from the caller, reducing vault liability.

**Arguments:**

- `<amountOfShares>`: Amount of stETH shares to burn

**Options:**

- `-v, --vault <address>`: Specify vault address

**Process:**

- Verifies caller has BURN_ROLE permission
- Checks caller has sufficient stETH balance approved
- Calculates impact on vault health and liability
- Displays burn confirmation with health projections
- Burns specified amount of shares

**Requirements:**

- Caller must have BURN_ROLE for the vault
- Sufficient stETH shares approved to the Dashboard contract

### burn-steth

Burns stETH tokens (by amount) from the caller, reducing vault liability.

**Arguments:**

- `<amountOfSteth>`: Amount of stETH tokens to burn

**Options:**

- `-v, --vault <address>`: Specify vault address

**Process:**

- Verifies BURN_ROLE permission
- Validates stETH approval and balance
- Burns specified stETH amount

**Requirements:**

- Caller must have BURN_ROLE for the vault
- Sufficient stETH tokens approved to the Dashboard contract

### burn-wsteth

Burns wstETH tokens (by amount) from the caller, reducing vault liability.

**Arguments:**

- `<amountOfWsteth>`: Amount of wstETH tokens to burn

**Options:**

- `-v, --vault <address>`: Specify vault address

**Process:**

- Verifies BURN_ROLE permission
- Validates wstETH approval and balance
- Burns specified wstETH amount

**Requirements:**

- Caller must have BURN_ROLE for the vault
- Sufficient wstETH tokens approved to the Dashboard contract

### disburse-node-operator-fee

Transfers the node operator's accrued fee (if any) to the nodeOperatorFeeRecipient address.

**Options:**

- `-v, --vault <address>`: Specify vault address

**Process:**

- Checks if node operator has any disbursable fees
- Displays confirmation with recipient address and fee amount
- Transfers accrued fees to the nodeOperatorFeeRecipient

**Requirements:**

- Node operator must have accrued fees available for disbursement
- nodeOperatorFeeRecipient must be properly configured

**Returns:**

- Transaction hash and confirmation of fee disbursement

### set-node-operator-fee-recipient (set-no-f-r)

Sets the node operator fee recipient address for the vault. This address will receive node operator fees when they are disbursed.

**Options:**

- `-v, --vault <address>`: Specify vault address
- `-rec, --recipient <address>`: Address of the new node operator fee recipient

**Process:**

- Verifies caller has NODE_OPERATOR_MANAGER_ROLE permission
- Displays confirmation with new recipient address and vault
- Updates the nodeOperatorFeeRecipient setting for the vault

**Requirements:**

- Caller must have NODE_OPERATOR_MANAGER_ROLE for the vault
- Valid recipient address must be provided

**Use Case:** Configure where node operator fees will be sent when disbursed.

**Returns:**

- Transaction hash and confirmation of recipient update

### change-tier (ct)

Changes the vault tier by VAULT_CONFIGURATION_ROLE role with multi-role confirmation.

**Arguments:**

- `<tierId>`: Tier ID to set for the vault

**Options:**

- `-v, --vault <address>`: Specify vault address
- `-r, --requestedShareLimit <shares>`: Requested share limit (in shares)

**Process:**

- Reads the target tier information and share limit
- Uses requested share limit if provided; otherwise uses tier default
- Displays confirmation with tier ID and share limit
- Submits tier change for multi-role confirmation

**Requirements:**

- Caller must have VAULT_CONFIGURATION_ROLE for the vault

### change-tier-by-no (ct-no)

Vault tier change initiated by the node operator with multi-role confirmation.

**Arguments:**

- `<tierId>`: Tier ID to set for the vault

**Options:**

- `-v, --vault <address>`: Specify vault address
- `-r, --requestedShareLimit <shares>`: Requested share limit (in shares)

**Process:**

- Validates caller is the vault's node operator
- Reads the target tier information and share limit
- Uses requested share limit if provided; otherwise uses tier default
- Displays confirmation with tier ID and share limit
- Submits tier change via Operator Grid for confirmation

**Requirements:**

- Caller must be the vault's node operator

### sync-tier (st)

Requests a sync of tier on the OperatorGrid with multi-role confirmation.

**Options:**

- `-v, --vault <address>`: Specify vault address

**Process:**

- Displays confirmation with vault address
- Submits sync tier request to the vault contract
- Requires both vault owner and node operator confirmations to complete

**Requirements:**

- Caller must have appropriate permissions for the vault
- Both vault owner (via this function) AND node operator confirmations are required
- First call returns false (pending), second call with both confirmations completes the sync
- Confirmations expire after the configured period (default: 1 day)

**Use Case:** Synchronize vault tier configuration when changes need to be applied from the OperatorGrid system.

## Role-Based Access Control

All vault operations use role-based permissions:

- **FUND_ROLE**: Can add ETH to vault
- **WITHDRAW_ROLE**: Can withdraw ETH from vault
- **MINT_ROLE**: Can mint stETH/wstETH tokens
- **BURN_ROLE**: Can burn stETH tokens
- **Admin Roles**: Can manage vault configuration and roles

## Health and Safety Checks

The system includes automatic safety validations:

- **Health Monitoring**: Ensures vault remains solvent after operations
- **Report Freshness**: Validates oracle data is current
- **Capacity Limits**: Prevents over-minting beyond vault collateral
- **Balance Validations**: Verifies sufficient funds/approvals
- **Quarantine Checks**: Warns when vault capital is quarantined
- **Confirmation Prompts**: Requires user confirmation for all operations

## Error Handling

Comprehensive error checking for:

- **Insufficient Permissions**: Missing required roles
- **Insufficient Funds**: Inadequate ETH or stETH balances
- **Capacity Exceeded**: Minting beyond vault limits
- **Health Violations**: Operations that would make vault unhealthy
- **Stale Reports**: Outdated oracle data requiring refresh

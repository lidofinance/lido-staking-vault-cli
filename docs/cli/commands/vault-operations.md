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

| Command                                                                            | Description                                                                                                                                                                                   |
| ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| fund \<ether>                                                                      | fund vaults                                                                                                                                                                                   |
| withdraw \<eth>                                                                    | withdraws ether from the staking vault to a recipient                                                                                                                                         |
| mint-shares (mint) \<amountOfShares>                                               | mints stETH tokens backed by the vault to a recipient                                                                                                                                         |
| mint-wsteth \<amountOfWsteth>                                                      | mints wstETH tokens backed by the vault to a recipient                                                                                                                                        |
| mint-steth \<amountOfSteth>                                                        | mints stETH tokens backed by the vault to a recipient                                                                                                                                         |
| burn-shares (burn) \<amountOfShares>                                               | Burns stETH shares from the sender backed by the vault. Expects corresponding amount of stETH approved to this contract                                                                       |
| burn-steth \<amountOfSteth>                                                        | Burns stETH shares from the sender backed by the vault. Expects stETH amount approved to this contract.                                                                                       |
| burn-wsteth \<amountOfWsteth>                                                      | burn wstETH tokens from the sender backed by the vault                                                                                                                                        |
| disburse-node-operator-fee                                                         | transfers the node-operator`s accrued fee (if any) to nodeOperatorFeeRecipient                                                                                                                |
| set-node-operator-fee-recipient (set-no-f-r)                                       | sets the node operator fee recipient                                                                                                                                                          |
| change-tier-by-no (ct-no) \<tierId> [--steth]                                      | vault tier change by node operator with multi-role confirmation. For disconnected vaults this option is required. Use `--steth` to provide `--requestedShareLimit` in stETH instead of shares |
| change-tier (ct) \<tierId> [--steth]                                               | vault tier change with multi-role confirmation. Use `--steth` to provide `--requestedShareLimit` in stETH instead of shares                                                                   |
| sync-tier (st)                                                                     | requests a sync of tier on the OperatorGrid                                                                                                                                                   |
| connect-and-accept-tier (connect-and-accept) \<vault> \<tierId> \<limit> [--steth] | changes the tier of the vault and connects to VaultHub                                                                                                                                        |
| role-grant                                                                         | mass-grants multiple roles to multiple accounts                                                                                                                                               |
| role-revoke                                                                        | mass-revokes multiple roles from multiple accounts                                                                                                                                            |
| create-vault                                                                       | creates a new StakingVault and Dashboard contracts                                                                                                                                            |

## Command Details

### create-vault

Creates new StakingVault and Dashboard contracts with specified configuration.

**Sub-commands:**

- `create`: Creates vault and connects to VaultHub
- `create-without-connecting`: Creates vault without VaultHub connection
- `log-creating-vault-data` (alias: `log-data`): Retrieves vault creation data from a transaction hash

#### create

Creates a new StakingVault and Dashboard contracts and connects them to VaultHub.

**Usage:**

```bash
yarn start vo write create-vault create [quantity] [options]
```

Or using aliases:

```bash
yarn start vo w create-vault create [quantity] [options]
```

**Arguments:**

- `[quantity]`: Number of vaults to create (default: 1)

**Options:**

- `-da, --defaultAdmin <address>`: Default admin address (prompted if not provided)
- `-no, --nodeOperator <address>`: Node operator address (prompted if not provided)
- `-nom, --nodeOperatorManager <address>`: Node operator manager address (prompted if not provided)
- `-ce, --confirmExpiry <number>`: Confirmation expiry time in seconds (prompted if not provided)
- `-nof, --nodeOperatorFeeRate <number>`: Node operator fee rate in basis points, e.g., 100 = 1% (prompted if not provided)
- `-r, --roles <json>`: Additional role assignments in JSON format (optional)

**Examples:**

1. **Interactive mode (prompts for all parameters):**

```bash
yarn start vo write create-vault create
```

2. **Create 3 vaults with all parameters:**

```bash
yarn start vo write create-vault create 3 \
  --defaultAdmin 0x1234...5678 \
  --nodeOperator 0xabcd...ef00 \
  --nodeOperatorManager 0x9876...5432 \
  --confirmExpiry 86400 \
  --nodeOperatorFeeRate 100
```

3. **With additional roles:**

```bash
yarn start vo write create-vault create \
  --defaultAdmin 0x1234...5678 \
  --nodeOperator 0xabcd...ef00 \
  --nodeOperatorManager 0x9876...5432 \
  --confirmExpiry 86400 \
  --nodeOperatorFeeRate 100 \
  --roles '[{"account":"0xabc...","role":"FUND_ROLE"}]'
```

**Process:**

- Validates all addresses and parameters (prompts for missing values)
- Displays creation confirmation with all settings
- Deploys new StakingVault and Dashboard contracts
- Assigns specified roles and permissions
- Connects vault to VaultHub
- Returns vault and dashboard addresses

**Returns:**

- Vault contract address
- Dashboard contract address
- Transaction hash and block number

#### create-without-connecting

Creates a new StakingVault and Dashboard contracts without connecting to VaultHub.

**Usage:**

```bash
yarn start vo write create-vault create-without-connecting [quantity] [options]
```

Or using aliases:

```bash
yarn start vo w create-vault create-without-connecting [quantity] [options]
```

**Arguments:**

- `[quantity]`: Number of vaults to create (default: 1)

**Options:**

- `-da, --defaultAdmin <address>`: Default admin address (prompted if not provided)
- `-no, --nodeOperator <address>`: Node operator address (prompted if not provided)
- `-nom, --nodeOperatorManager <address>`: Node operator manager address (prompted if not provided)
- `-ce, --confirmExpiry <number>`: Confirmation expiry time in seconds (prompted if not provided)
- `-nof, --nodeOperatorFeeRate <number>`: Node operator fee rate in basis points, e.g., 100 = 1% (prompted if not provided)
- `-r, --roles <json>`: Additional role assignments in JSON format (optional)

**Examples:**

1. **Create vault without VaultHub connection:**

```bash
yarn start vo write create-vault create-without-connecting \
  --defaultAdmin 0x1234...5678 \
  --nodeOperator 0xabcd...ef00 \
  --nodeOperatorManager 0x9876...5432 \
  --confirmExpiry 86400 \
  --nodeOperatorFeeRate 100
```

**Process:**

- Same as `create` command but skips VaultHub connection

### info

Displays comprehensive information about a StakingVault through its Dashboard contract.

**Usage:**

```bash
yarn start vo read info [options]
```

Or using aliases:

```bash
yarn start vo r info [options]
```

**Options:**

- `-v, --vault <address>`: Specify vault address (optional - prompts for selection if not provided)

**Information Displayed:**

- Contract addresses (vault, dashboard, VaultHub, Lido Locator)
- Fee configuration (reserve ratio, rebalance threshold, infrastructure fees)
- Vault metrics (total value, locked funds, liability shares)
- Minting capacity and limits
- Node operator settings and fee rates
- Quarantine status warning (if applicable)

**Use Case:** Get complete technical overview of vault configuration and current state.

### health

Checks and displays the health status of a StakingVault.

**Usage:**

```bash
yarn start vo read health [options]
```

Or using aliases:

```bash
yarn start vo r health [options]
```

**Options:**

- `-v, --vault <address>`: Specify vault address (optional - prompts for selection if not provided)

**Health Metrics:**

- Health ratio percentage
- Healthy/unhealthy status
- Total value in ETH
- Liability shares in stETH
- Force rebalance threshold
- Quarantine status warning (if applicable)

**Use Case:** Monitor vault health status and determine if maintenance actions are needed.

### overview

Provides a comprehensive dashboard view of vault performance and status with visual indicators.

**Usage:**

```bash
yarn start vo read overview [options]
```

Or using aliases:

```bash
yarn start vo r overview [options]
```

**Options:**

- `-v, --vault <address>`: Specify vault address (optional - prompts for selection if not provided)

**Overview Includes:**

- Health factor and utilization ratio
- Reserve and fee rate information
- Available withdrawal capacity
- Collateral and locked funds breakdown
- Minting capacity (total and remaining)
- Visual health and liability bars
- Quarantine status warning (if applicable)

**Use Case:** Get complete operational overview for vault management decisions.

### roles

Displays role assignments and permissions for the vault.

**Usage:**

```bash
yarn start vo read roles [options]
```

Or using aliases:

```bash
yarn start vo r roles [options]
```

**Options:**

- `-v, --vault <address>`: Specify vault address (optional - prompts for selection if not provided)

**Role Information:**

- Admin roles and permissions
- Node operator assignments
- Fund, mint, burn, and withdraw role holders
- Quarantine status warning (if applicable)

**Use Case:** Audit access control and permission structure.

### fund

Adds ETH to a StakingVault to increase its total value and collateral.

**Usage:**

```bash
yarn start vo write fund <ether> [options]
```

Or using aliases:

```bash
yarn start vo w fund <ether> [options]
```

**Arguments:**

- `<ether>`: Amount of ETH to fund the vault (in ETH, e.g., 1.5)

**Options:**

- `-v, --vault <address>`: Specify vault address (optional - prompts for selection if not provided)

**Process:**

- Checks quarantine status (requires confirmation if quarantined)
- Verifies caller has FUND_ROLE permission
- Ensures report is fresh (submits update if needed)
- Displays funding confirmation with amount and vault address
- Transfers ETH directly to the vault contract

**Requirements:**

- Caller must have FUND_ROLE for the vault
- Sufficient ETH balance for funding
- Vault report must be fresh

### withdraw

Withdraws ETH from a StakingVault to a specified recipient.

**Usage:**

```bash
yarn start vo write withdraw <eth> [options]
```

Or using aliases:

```bash
yarn start vo w withdraw <eth> [options]
```

**Arguments:**

- `<eth>`: Amount of ETH to withdraw (in ETH, e.g., 1.5)

**Options:**

- `-v, --vault <address>`: Specify vault address (optional - prompts for selection if not provided)
- `-r, --recipient <address>`: Address to receive withdrawn ETH (optional - prompts if not provided)

**Process:**

- Checks quarantine status (requires confirmation if quarantined)
- Verifies caller has WITHDRAW_ROLE permission
- Ensures vault report is fresh (submits update if needed)
- Displays withdrawal confirmation
- Transfers ETH from vault to recipient

**Requirements:**

- Caller must have WITHDRAW_ROLE for the vault
- Vault must have sufficient withdrawable balance
- Vault report must be fresh

### mint-shares (mint)

Mints stETH shares backed by the vault's collateral to a recipient.

**Usage:**

```bash
yarn start vo write mint-shares <amountOfShares> [options]
```

Or using aliases:

```bash
yarn start vo w mint <amountOfShares> [options]
```

**Arguments:**

- `<amountOfShares>`: Amount of stETH shares to mint (in Shares, e.g., 1.5)

**Options:**

- `-v, --vault <address>`: Specify vault address (optional - prompts for selection if not provided)
- `-r, --recipient <address>`: Address to receive minted shares (optional - prompts if not provided)

**Process:**

- Checks quarantine status (requires confirmation if quarantined)
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

**Usage:**

```bash
yarn start vo write mint-wsteth <amountOfWsteth> [options]
```

Or using aliases:

```bash
yarn start vo w mint-wsteth <amountOfWsteth> [options]
```

**Arguments:**

- `<amountOfWsteth>`: Amount of wstETH to mint (in wstETH, e.g., 1.5)

**Options:**

- `-v, --vault <address>`: Specify vault address (optional - prompts for selection if not provided)
- `-r, --recipient <address>`: Address to receive wstETH (optional - prompts if not provided)

**Process:**

- Checks quarantine status (requires confirmation if quarantined)
- Verifies caller has MINT_ROLE permission
- Follows same health and capacity checks as mint-shares
- Mints wstETH tokens to recipient

**Requirements:**

- Caller must have MINT_ROLE for the vault
- Sufficient minting capacity available
- Vault must remain healthy after minting

### mint-steth

Mints stETH tokens (by amount, not shares) backed by the vault to a recipient.

**Usage:**

```bash
yarn start vo write mint-steth <amountOfSteth> [options]
```

Or using aliases:

```bash
yarn start vo w mint-steth <amountOfSteth> [options]
```

**Arguments:**

- `<amountOfSteth>`: Amount of stETH tokens to mint (in stETH, e.g., 1.5)

**Options:**

- `-v, --vault <address>`: Specify vault address (optional - prompts for selection if not provided)
- `-r, --recipient <address>`: Address to receive stETH (optional - prompts if not provided)

**Process:**

- Checks quarantine status (requires confirmation if quarantined)
- Verifies caller has MINT_ROLE permission
- Performs health and capacity validations
- Mints stETH tokens to recipient

**Requirements:**

- Caller must have MINT_ROLE for the vault
- Sufficient minting capacity available
- Vault must remain healthy after minting

### burn-shares (burn)

Burns stETH shares from the caller, reducing vault liability.

**Usage:**

```bash
yarn start vo write burn-shares <amountOfShares> [options]
```

Or using aliases:

```bash
yarn start vo w burn <amountOfShares> [options]
```

**Arguments:**

- `<amountOfShares>`: Amount of stETH shares to burn (in Shares, e.g., 1.5)

**Options:**

- `-v, --vault <address>`: Specify vault address (optional - prompts for selection if not provided)

**Process:**

- Checks quarantine status (requires confirmation if quarantined)
- Verifies caller has BURN_ROLE permission
- Checks caller has sufficient stETH balance and approval
- If approval is insufficient, prompts to approve required amount
- Calculates impact on vault health and liability
- Displays burn confirmation with health projections
- Burns specified amount of shares

**Requirements:**

- Caller must have BURN_ROLE for the vault
- Sufficient stETH shares balance
- Sufficient stETH shares approved to the Dashboard contract (can be done automatically)

### burn-steth

Burns stETH tokens (by amount) from the caller, reducing vault liability.

**Usage:**

```bash
yarn start vo write burn-steth <amountOfSteth> [options]
```

Or using aliases:

```bash
yarn start vo w burn-steth <amountOfSteth> [options]
```

**Arguments:**

- `<amountOfSteth>`: Amount of stETH tokens to burn (in stETH, e.g., 1.5)

**Options:**

- `-v, --vault <address>`: Specify vault address (optional - prompts for selection if not provided)

**Process:**

- Checks quarantine status (requires confirmation if quarantined)
- Verifies caller has BURN_ROLE permission
- Validates stETH approval and balance
- If approval is insufficient, prompts to approve required amount
- Burns specified stETH amount

**Requirements:**

- Caller must have BURN_ROLE for the vault
- Sufficient stETH tokens balance
- Sufficient stETH tokens approved to the Dashboard contract (can be done automatically)

### burn-wsteth

Burns wstETH tokens (by amount) from the caller, reducing vault liability.

**Usage:**

```bash
yarn start vo write burn-wsteth <amountOfWsteth> [options]
```

Or using aliases:

```bash
yarn start vo w burn-wsteth <amountOfWsteth> [options]
```

**Arguments:**

- `<amountOfWsteth>`: Amount of wstETH tokens to burn (in wstETH, e.g., 1.5)

**Options:**

- `-v, --vault <address>`: Specify vault address (optional - prompts for selection if not provided)

**Process:**

- Checks quarantine status (requires confirmation if quarantined)
- Verifies caller has BURN_ROLE permission
- Validates wstETH approval and balance
- If approval is insufficient, prompts to approve required amount
- Burns specified wstETH amount

**Requirements:**

- Caller must have BURN_ROLE for the vault
- Sufficient wstETH tokens balance
- Sufficient wstETH tokens approved to the Dashboard contract (can be done automatically)

### disburse-node-operator-fee

Transfers the node operator's accrued fee (if any) to the nodeOperatorFeeRecipient address.

**Usage:**

```bash
yarn start vo write disburse-node-operator-fee [options]
```

Or using aliases:

```bash
yarn start vo w disburse-node-operator-fee [options]
```

**Options:**

- `-v, --vault <address>`: Specify vault address (optional - prompts for selection if not provided)

**Process:**

- Checks quarantine status (requires confirmation if quarantined)
- Retrieves node operator fee recipient address
- Checks if node operator has any disbursable fees (exits if none)
- Displays confirmation with recipient address and fee amount in ETH
- Transfers accrued fees to the nodeOperatorFeeRecipient

**Requirements:**

- Node operator must have accrued fees available for disbursement (> 0 ETH)
- nodeOperatorFeeRecipient must be properly configured

**Returns:**

- Transaction hash and confirmation of fee disbursement

### set-node-operator-fee-recipient (set-no-f-r)

Sets the node operator fee recipient address for the vault. This address will receive node operator fees when they are disbursed.

**Usage:**

```bash
yarn start vo write set-node-operator-fee-recipient [options]
```

Or using aliases:

```bash
yarn start vo w set-no-f-r [options]
```

**Options:**

- `-v, --vault <address>`: Specify vault address (optional - prompts for selection if not provided)
- `-rec, --recipient <address>`: Address of the new node operator fee recipient (optional - prompts if not provided)

**Process:**

- Verifies caller has NODE_OPERATOR_MANAGER_ROLE permission
- Prompts for recipient address if not provided
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

**Usage:**

```bash
yarn start vo write change-tier <tierId> [options]
```

Or using aliases:

```bash
yarn start vo w ct <tierId> [options]
```

**Arguments:**

- `<tierId>`: Tier ID to change to (numeric value)

**Options:**

- `-v, --vault <address>`: Specify vault address (optional - prompts for selection if not provided)
- `-r, --requestedShareLimit <value>`: Requested share limit — in shares by default, or in stETH if `--steth` is provided (optional)
- `--steth`: Interpret `--requestedShareLimit` as a stETH value; converts to shares on-chain via `getSharesByPooledEth` before submitting

**Process:**

- Reads the target tier information and share limit from OperatorGrid
- If `--requestedShareLimit` provided with `--steth`, converts the stETH value to shares on-chain and logs the conversion
- If `--requestedShareLimit` provided, prompts for confirmation to use custom limit
- Uses requested share limit if provided; otherwise uses tier default
- Displays confirmation with tier ID and share limit
- Verifies caller has VAULT_CONFIGURATION_ROLE permission
- Ensures vault report is fresh (submits update if needed)
- Submits tier change transaction

**Requirements:**

- Caller must have VAULT_CONFIGURATION_ROLE for the vault
- Vault report must be fresh
- Works for connected vaults; for disconnected vaults use `change-tier-by-no`

### change-tier-by-no (ct-no)

Vault tier change initiated by the node operator with multi-role confirmation. For disconnected vaults this option is required.

**Usage:**

```bash
yarn start vo write change-tier-by-no <tierId> [options]
```

Or using aliases:

```bash
yarn start vo w ct-no <tierId> [options]
```

**Arguments:**

- `<tierId>`: Tier ID to change to (numeric value)

**Options:**

- `-v, --vault <address>`: Specify vault address (optional - prompts for selection if not provided)
- `-r, --requestedShareLimit <value>`: Requested share limit — in shares by default, or in stETH if `--steth` is provided (optional)
- `--steth`: Interpret `--requestedShareLimit` as a stETH value; converts to shares on-chain via `getSharesByPooledEth` before submitting

**Process:**

- Validates caller is the vault's node operator (throws error if not)
- Reads the target tier information and share limit from OperatorGrid
- If `--requestedShareLimit` provided with `--steth`, converts the stETH value to shares on-chain and logs the conversion
- If `--requestedShareLimit` provided, prompts for confirmation to use custom limit
- Uses requested share limit if provided; otherwise uses tier default
- Displays confirmation with tier ID and share limit
- Ensures vault report is fresh (submits update if needed)
- Submits tier change via OperatorGrid contract

**Requirements:**

- Caller must be the vault's node operator (exact address match)
- Vault report must be fresh
- **Required for disconnected vaults** - use this command instead of `change-tier` when vault is disconnected from VaultHub

### sync-tier (st)

Requests a sync of tier on the OperatorGrid with multi-role confirmation.

**Usage:**

```bash
yarn start vo write sync-tier [options]
```

Or using aliases:

```bash
yarn start vo w st [options]
```

**Options:**

- `-v, --vault <address>`: Specify vault address (optional - prompts for selection if not provided)

**Process:**

- Displays confirmation with vault address
- Ensures vault report is fresh (submits update if needed)
- Submits sync tier request to the vault contract
- Requires both vault owner and node operator confirmations to complete

**Requirements:**

- Caller must have appropriate permissions for the vault
- Both vault owner (via this function) AND node operator confirmations are required
- First call returns false (pending), second call with both confirmations completes the sync
- Confirmations expire after the configured period (default: 1 day)
- Vault report must be fresh

**Use Case:** Synchronize vault tier configuration when changes need to be applied from the OperatorGrid system.

### connect-and-accept-tier (connect-and-accept)

Changes the tier of the vault and connects to VaultHub.

**Usage:**

```bash
yarn start vo write connect-and-accept-tier <vaultAddress> <tierId> <requestedShareLimit> [options]
```

Or using aliases:

```bash
yarn start vo w connect-and-accept <vaultAddress> <tierId> <requestedShareLimit> [options]
```

**Arguments:**

- `<vaultAddress>`: Vault address (required)
- `<tierId>`: Tier to change to (numeric value)
- `<requestedShareLimit>`: Requested new share limit for the vault — in shares by default, or in stETH if `--steth` is provided

**Options:**

- `-f, --fund`: Fund the vault with 1 ETH without balance check (default: false)
- `--steth`: Interpret `<requestedShareLimit>` as a stETH value; converts to shares on-chain via `getSharesByPooledEth` before submitting

**Process:**

1. Reads current `settledGrowth` from the dashboard
2. If `--steth` is provided, converts the stETH value to shares on-chain and logs the conversion
3. Displays confirmation with target tier, vault address, share limit, settled growth, and funding details
4. Handles funding:
   - If `--fund` flag is provided: Always funds with 1 ETH
   - If `--fund` flag is NOT provided (default): Checks vault's available balance and prompts for funding if insufficient
5. Submits transaction to change tier and connect to VaultHub with optional funding

**Requirements:**

- Vault must be in a state allowing connection
- Caller must have appropriate permissions
- Reverts if `settledGrowth` is not corrected after the vault is disconnected
- Vault must have sufficient balance OR funding must be confirmed/provided

**Examples:**

```bash
# Connect vault to tier 1 with share limit of 1000, automatic balance check
yarn start vo w connect-and-accept 0x1234...5678 1 1000

# Connect vault and force fund with 1 ETH
yarn start vo w connect-and-accept 0x1234...5678 1 1000 --fund
```

### role-grant

Mass-grants multiple roles to multiple accounts on the vault.

**Usage:**

```bash
yarn start vo write role-grant [options]
```

Or using aliases:

```bash
yarn start vo w role-grant [options]
```

**Options:**

- `-v, --vault <address>`: Specify vault address
- `-r, --roleAssignments <json>`: JSON array of role assignments (optional - if not provided, will be prompted interactively)

**Role Assignment Format:**

```json
[
  {
    "account": "0x1234...5678",
    "role": "0x0000000000000000000000000000000000000000000000000000000000000000"
  },
  {
    "account": "0xabcd...ef00",
    "role": "0x<32-byte-role-hash>"
  }
]
```

The `role` field must be a 32-byte hex value (bytes32). Use `yarn start vo r roles` to see role hash values for your vault.

**Examples:**

1. **Interactive mode (prompts for role assignments):**

```bash
yarn start vo write role-grant --vault 0x1234...5678
```

2. **Using JSON option:**

```bash
yarn start vo write role-grant \
  --vault 0x1234...5678 \
  --roleAssignments '[{"account":"0xabc...","role":"0x0000000000000000000000000000000000000000000000000000000000000000"}]'
```

**Process:**

- Validates vault address and role assignments
- Displays table with roles to be granted
- Requires confirmation before execution
- Grants all roles in a single transaction

**Requirements:**

- Caller must have admin permissions for the vault
- All account addresses must be valid
- Role names must be valid vault roles

**Use Case:** Efficiently assign multiple roles to multiple accounts in one transaction.

### role-revoke

Mass-revokes multiple roles from multiple accounts on the vault.

**Usage:**

```bash
yarn start vo write role-revoke [options]
```

Or using aliases:

```bash
yarn start vo w role-revoke [options]
```

**Options:**

- `-v, --vault <address>`: Specify vault address
- `-r, --roleAssignments <json>`: JSON array of role assignments (optional - if not provided, will be prompted interactively)

**Role Assignment Format:**

```json
[
  {
    "account": "0x1234...5678",
    "role": "0x0000000000000000000000000000000000000000000000000000000000000000"
  },
  {
    "account": "0xabcd...ef00",
    "role": "0x<32-byte-role-hash>"
  }
]
```

The `role` field must be a 32-byte hex value (bytes32). Use `yarn start vo r roles` to see role hash values for your vault.

**Examples:**

1. **Interactive mode (prompts for role assignments):**

```bash
yarn start vo write role-revoke --vault 0x1234...5678
```

2. **Using JSON option:**

```bash
yarn start vo write role-revoke \
  --vault 0x1234...5678 \
  --roleAssignments '[{"account":"0xabc...","role":"0x0000000000000000000000000000000000000000000000000000000000000000"}]'
```

**Process:**

- Validates vault address and role assignments
- Displays table with roles to be revoked
- Requires confirmation before execution
- Revokes all roles in a single transaction

**Requirements:**

- Caller must have admin permissions for the vault
- All account addresses must be valid
- Role names must be valid vault roles

**Use Case:** Efficiently revoke multiple roles from multiple accounts in one transaction.

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

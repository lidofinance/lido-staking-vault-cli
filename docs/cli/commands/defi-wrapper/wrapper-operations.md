---
sidebar_position: 1
---

# Wrapper Operations

## Command

```bash
yarn start dw uc wrapper-operations [arguments] [-options]
# or
yarn start dw uc wo [arguments] [-options]
```

## Wrapper Operations commands list

```bash
yarn start dw uc wo -h
```

## Overview

Wrapper Operations commands manage DeFi wrapper pools including creation, configuration, and monitoring. These commands handle the deployment and management of various pool strategies (GGV, STV, STV-stETH) that wrap Staking Vaults to provide additional DeFi functionality.

## API

| Command   | Description    |
| --------- | -------------- |
| read (r)  | read commands  |
| write (w) | write commands |

### Read

| Command      | Description              |
| ------------ | ------------------------ |
| info         | get wrapper info         |
| report-fresh | check if report is fresh |

### Write

| Command     | Description            |
| ----------- | ---------------------- |
| create-pool | pool creation commands |

#### Create Pool

| Command                | Description                                                   |
| ---------------------- | ------------------------------------------------------------- |
| create-pool-ggv        | initiates deployment of a GGV strategy pool                   |
| create-pool-stv        | initiates deployment of a STV staking pool                    |
| create-pool-stv-steth  | initiates deployment of a STV-STETH pool with minting enabled |
| create-pool-finalize   | finalizes the deployment of a pool                            |
| log-creating-pool-data | logs the data of the created pool for UI configuration        |

## Command Details

### info

Displays comprehensive information about a DeFi wrapper pool including configuration, metrics, and status.

**Arguments:**

- `<address>`: Wrapper pool contract address

**Information Displayed:**

**Contract Addresses:**

- Vault: Associated StakingVault address
- StETH: stETH token contract
- WSTETH: Wrapped stETH contract (if applicable)
- Dashboard: Dashboard contract address
- VaultHub: VaultHub contract address
- WithdrawalQueue: Withdrawal queue contract address
- Distributor: Distributor contract address

**Pool Configuration:**

- Pool Type: Pool type name
- Reserve Ratio BP: Reserve ratio in basis points
- Forced Rebalance Threshold BP: Threshold for forced position rebalancing
- Max Loss Socialization BP: Maximum loss that can be socialized

**Pool Metrics:**

- Total Nominal Assets: Nominal assets in ETH
- Total Assets: Actual assets in ETH
- Total Supply: Pool token supply
- Total Liability Shares: Total liability in stETH shares
- Total Minted Steth Shares: Total stETH shares minted by the pool
- Total Exceeding Minted Steth: Exceeding minted stETH available for rebalancing
- Total Unassigned Liability: Unassigned liability in shares and stETH

**Status Flags:**

- Is Deposits Paused: Deposit pause status
- Is Minting Paused: Minting pause status (if applicable)
- Is Report Fresh: Oracle report freshness
- Allow List Enabled: Whether allow list is active
- Allow List Size: Number of addresses on allow list
- Deposits Feature ID: Feature identifier for deposits
- Minting Feature ID: Feature identifier for minting (if applicable)

**Example:**

```bash
# Get wrapper info
yarn start dw uc wo r info 0x
```

**Use Case:** Get complete technical overview of wrapper configuration and current operational state.

### report-fresh

Checks if the vault report backing the wrapper pool is fresh (up-to-date with oracle data).

**Arguments:**

- `<address>`: Wrapper pool contract address

**Output:**

- **Is Report Fresh**: Boolean indicating if the report is current

**Example:**

```bash
# Check report freshness
yarn start dw uc wo r report-fresh 0x
```

**Use Case:** Verify that the vault has an up-to-date oracle report before performing operations that depend on current valuation data.

## Pool Creation Commands

### create-pool-ggv

Initiates deployment of a GGV strategy pool.

**Arguments:**

- `<address>`: Factory contract address

**Common Options (all pool types):**

- `-no, --nodeOperator <address>`: Node operator address
- `-nom, --nodeOperatorManager <address>`: Node operator manager address
- `-nof, --nodeOperatorFeeRate <number>`: Node operator fee rate in basis points (e.g., 100 = 1%)
- `-ce, --confirmExpiry <seconds>`: Confirmation expiry time in seconds
- `-md, --minDelaySeconds <seconds>`: Minimum delay for timelock operations
- `-mwd, --minWithdrawalDelayTime <seconds>`: Minimum withdrawal delay time
- `-n, --name <string>`: Name of the pool shares token
- `-s, --symbol <string>`: Symbol of the pool shares token
- `-p, --proposer <address>`: Timelock proposer address
- `-e, --executor <address>`: Timelock executor address
- `-ec, --emergencyCommittee <address>`: Emergency committee address

**GGV-Specific Options:**

- `-rrg, --reserveRatioGapBP <number>`: Reserve ratio gap in basis points

**Process:**

1. Validates all input parameters and addresses
2. Prompts for any missing configuration values
3. Displays comprehensive configuration summary
4. Requests user confirmation
5. Executes `createPoolGGVStart()` transaction
6. Retrieves pool creation event data
7. Automatically finalizes pool creation

**Example:**

```bash
yarn start dw uc wo w create-pool create-pool-ggv 0x1234...factory
```

**Returns:**

- Pool contract address
- Vault contract address
- Dashboard contract address
- Withdrawal queue address
- Distributor address
- Transaction hash and confirmation

### create-pool-stv

Initiates deployment of a STV staking pool with optional allow list functionality.

**Arguments:**

- `<address>`: Factory contract address

**Common Options:** See create-pool-ggv

**STV-Specific Options:**

- `-al, --allowList <boolean>`: Enable allow list functionality (true/false)

**Process:**

1. Validates factory address and configuration
2. Prompts for vault configuration parameters
3. Prompts for allow list setting if not provided
4. Displays configuration summary
5. Requests confirmation
6. Executes `createPoolStvStart()` transaction
7. Retrieves creation event data
8. Finalizes pool deployment

**Example:**

```bash
yarn start dw uc wo w create-pool create-pool-stv 0x1234...factory
```

### create-pool-stv-steth

Initiates deployment of a STV-STETH pool with stETH minting capabilities enabled.

**Arguments:**

- `<address>`: Factory contract address

**Common Options:** See create-pool-ggv

**STV-STETH-Specific Options:**

- `-rrg, --reserveRatioGapBP <number>`: Reserve ratio gap in basis points
- `-al, --allowList <boolean>`: Enable allow list functionality (true/false)

**Process:**

1. Validates factory address and all parameters
2. Prompts for vault configuration
3. Prompts for allow list and reserve ratio settings
4. Displays full configuration including minting parameters
5. Requests confirmation
6. Executes `createPoolStvStETHStart()` transaction
7. Retrieves creation event data
8. Finalizes pool deployment with minting capabilities

**Example:**

```bash
yarn start dw uc wo w create-pool create-pool-stv-steth 0x1234...factory
```

**Features:**

- Full STV staking pool functionality
- stETH minting against pool collateral
- Configurable reserve ratio for safety
- Optional allow list for access control
- Forced rebalance protection for unhealthy positions

### create-pool-finalize

Finalizes the deployment of a pool. Used if the pool creation was not finalized in the first step (Multisig case).

**Arguments:**

- `<address>`: Factory contract address
- `<txHash>`: Transaction hash of the first step of the pool creation

**Process:**

1. Retrieves transaction receipt from the provided transaction hash
2. Extracts pool creation event data from the receipt
3. Logs the pool creation event data
4. Executes pool creation finalization

**Example:**

```bash
yarn start dw uc wo w create-pool create-pool-finalize 0x1234...factory 0xabcd...txHash
```

**Use Case:** Complete pool deployment when the initial creation transaction was sent from a multisig wallet and finalization needs to be performed separately.

### log-creating-pool-data

Logs the data of the created pool. Will be necessary for use in the UI configuration.

**Arguments:**

- `<txHash>`: Transaction hash of the first step of the pool creation
- `<finalizeTxHash>`: Transaction hash of the final step of the pool creation

**Process:**

1. Retrieves transaction receipts for both creation steps
2. Extracts event data from both transactions
3. Logs comprehensive pool data including:
   - Pool creation event data (first step)
   - Pool finalization event data (final step)

**Example:**

```bash
yarn start dw uc wo w create-pool log-creating-pool-data 0xabcd...txHash 0xefgh...finalizeTxHash
```

**Use Case:** Generate pool configuration data for UI integration after pool deployment is complete.

## Troubleshooting

### Transaction Fails During Creation

**Possible Causes:**

- Insufficient gas
- Invalid configuration parameters
- Network congestion

**Solutions:**

- Increase gas limit in wallet
- Verify all parameters are correct
- Retry during lower network usage

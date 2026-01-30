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

Wrapper Operations commands manage DeFi wrapper pools including creation, configuration, and monitoring. These commands handle the deployment and management of various pool type (STV, STV-stETH, STV-Strategy) that wrap Staking Vaults to provide additional DeFi functionality.

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

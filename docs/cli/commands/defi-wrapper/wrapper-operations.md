---
sidebar_position: 3
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

Wrapper Operations commands allow management and monitoring of DeFi wrapper pools. These commands handle the day-to-day operations like withdrawal finalization and more edge case operations like governance and position management of various pool type (STV, STV-stETH, STV-Strategy) that wrap Staking Vaults to provide additional DeFi functionality.

## API

| Command   | Description    |
| --------- | -------------- |
| read (r)  | read commands  |
| write (w) | write commands |

### Read

| Command           | Description                         |
| ----------------- | ----------------------------------- |
| info              | get wrapper info                    |
| allow-list        | get full or partial allow list data |
| report-fresh      | check if report is fresh            |
| withdrawal-status | get status of withdrawal queue      |

### Write

| Command                            | Description                                                                     |
| ---------------------------------- | ------------------------------------------------------------------------------- |
| set-finalization-gas-cost-coverage | set finalization gas cost coverage                                              |
| finalize-withdrawals               | finalize pending withdrawals in the wrapper                                     |
| sync-vault-params                  | sync vault params between vault & pool                                          |
| allow-list-add                     | add addresses to allow list                                                     |
| allow-list-remove                  | remove addresses from allow list                                                |
| auto-report                        | watches for new reports, automatically submits report and finalizes withdrawals |

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
yarn start dw uc wo r info 0x...
```

**Use Case:** Get complete technical overview of wrapper configuration and current operational state.

### allow-list

Retrieves the entire allow list for a given pool, or checks the status of specific addresses.

**Arguments:**

- `<address>`: Wrapper pool contract address
- `[addresses...]`: (Optional) Space-separated list of addresses to check.

**Output:**

- If no addresses are provided, it lists all addresses on the allow list.
- If addresses are provided, it shows whether each address is on the list.

**Example:**

```bash
# Get the full allow list
yarn start dw uc wo r allow-list 0x...

# Check specific addresses
yarn start dw uc wo r allow-list 0x... 0x... 0x...
```

**Use Case:** Verify which users are authorized to interact with a protected pool.

### report-fresh

Checks if the vault report backing the wrapper pool is fresh (up-to-date with oracle data).

**Arguments:**

- `<address>`: Wrapper pool contract address

**Output:**

- **Is Report Fresh**: Boolean indicating if the report is current

**Example:**

```bash
# Check report freshness
yarn start dw uc wo r report-fresh 0x...
```

**Use Case:** Verify that the vault has an up-to-date oracle report before performing operations that depend on current valuation data.

### withdrawal-status

This command allows you to monitor the state of the withdrawal queue to determine if the finalization of a withdrawal request can be completed.

**Arguments:**

- `<address>`: Wrapper pool contract address

**Example:**

```bash
# Get withdrawal queue status
yarn start dw uc wo r withdrawal-status 0x...
```

**Use Case:**

Use this command to check the current status of the withdrawal queue and understand if withdrawal requests can be finalized.

### set-finalization-gas-cost-coverage

Sets the gas cost coverage for withdrawal finalization, which is the amount of compensation paid to an operator for processing a withdrawal. This is a privileged operation that can only be performed by an account with the appropriate role.

The command includes several validation checks:

- It ensures the provided `gasCostCoverage` does not exceed the maximum allowed value defined in the contract.
- It checks if the new value is different from the current one to prevent unnecessary transactions.

**Arguments:**

- `<address>`: The contract address of the `WithdrawalQueue`.
- `<gasCostCoverage>`: The new gas cost coverage value in wei.

**Example:**

```bash
# Set finalization gas cost coverage to 100,000 wei
yarn start dw uc wo w set-finalization-gas-cost-coverage 0x... 100000
```

**Use Case:** Adjust the gas compensation for operators who finalize withdrawals. This might be necessary to account for changes in network gas prices, ensuring that operators are adequately compensated for their work.

### finalize-withdrawals

Finalizes pending withdrawal requests in the wrapper's withdrawal queue. This command can be executed by any operator.

A key feature of this command is its built-in report freshness check. Before attempting to finalize withdrawals, it verifies if the underlying vault has a fresh oracle report. If the report is stale, the command will prompt the user to submit a new one, as finalizations can only occur against a fresh report.

**Arguments:**

- `<poolAddress>`: The contract address of the wrapper pool.

**Options:**

| Option                                     | Description                                                                       | Default   |
| ------------------------------------------ | --------------------------------------------------------------------------------- | --------- |
| `-mxr, --max-requests <count>`             | The maximum number of withdrawal requests to finalize in a single transaction.    | `1000`    |
| `-gcr, --gas-coverage-recipient <address>` | The address to receive any gas coverage fees. Defaults to the transaction sender. | `0x0...0` |

**Example:**

```bash
# Finalize up to 500 withdrawals for a given pool
yarn start dw uc wo w finalize-withdrawals 0x... --max-requests 500
```

**Use Case:** Process the queue of pending withdrawal requests. The built-in freshness check ensures that finalizations are safe and based on the latest vault state.

### sync-vault-params

Synchronizes the vault parameters between the Staking Vault and the wrapper pool. This is a privileged operation.

**Arguments:**

- `<poolAddress>`: Wrapper pool contract address

**Example:**

```bash
# Sync vault parameters
yarn start dw uc wo w sync-vault-params 0x...
```

**Use Case:** Ensure that the wrapper pool has the latest configuration from the underlying Staking Vault.

### allow-list-add

Adds one or more addresses to the allow list for a given pool. This is a privileged operation.

**Arguments:**

- `<poolAddress>`: Wrapper pool contract address
- `<addressToAdd...>`: Space-separated list of addresses to add.

**Example:**

```bash
# Add addresses to the allow list
yarn start dw uc wo w allow-list-add 0x... 0x... 0x...
```

**Use Case:** Grant access to new users for a protected pool.

### allow-list-remove

Removes one or more addresses from the allow list for a given pool. This is a privileged operation.

**Arguments:**

- `<poolAddress>`: Wrapper pool contract address
- `<addressesToRemove...>`: Space-separated list of addresses to remove.

**Example:**

```bash
# Remove addresses from the allow list
yarn start dw uc wo w allow-list-remove 0x... 0x... 0x...
```

**Use Case:** Revoke access for users of a protected pool.

### auto-report

Starts a long-running process that watches for new oracle reports, automatically submits them to the vault, and finalizes pending withdrawals. This command is designed for continuous operation, making it ideal for automation.

For production environments, it is highly recommended to run this command using a process manager (like `pm2` or `systemd`) to ensure it runs continuously and is restarted if it fails.

**Arguments:**

- `<poolAddress>`: The contract address of the wrapper pool to monitor.

**Options:**

| Option                               | Description                                                                                               | Default      |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------- | ------------ |
| `--skip-report`                      | If set, the report submission step will be skipped.                                                       | `false`      |
| `--skip-finalize`                    | If set, the withdrawal finalization step will be skipped.                                                 | `false`      |
| `--callback-url <callbackUrl>`       | A URL to which a POST request will be sent upon successful report submission and withdrawal finalization. | `undefined`  |
| `--gas-coverage-recipient <address>` | The address that will receive gas coverage, if any is provided.                                           | Tx Sender    |
| `--max-requests <count>`             | The maximum number of withdrawal requests to finalize in a single run.                                    | `1000`       |
| `--polling-interval <milliseconds>`  | The interval in milliseconds for checking for new reports.                                                | `60000` (1m) |

**Callback URL Hint:**

If you provide a `--callback-url`, the `auto-report` command will send a `POST` request to the specified URL after a successful run. This can be used to integrate with external monitoring systems or to trigger other automated processes.

The payload of the POST request will be a JSON object with the following structure:

```json
{
  "poolAddress": "0x...",
  "vaultAddress": "0x...",
  "isConnected": true,
  "wasReportFresh": false,
  "reportSubmitted": true,
  "reportTxHash": "0x...",
  "canFinalize": true,
  "finalizationRequested": true,
  "finalizationTxHash": "0x...",
  "totalUnfinalizedRequests": "100",
  "totalUnfinalizedAssets": "10000000000000000000",
  "requestsFinalized": "50",
  "assetsFinalized": "5000000000000000000"
}
```

- `poolAddress`: The address of the pool that was processed.
- `vaultAddress`: The address of the vault associated with the pool.
- `isConnected`: Boolean indicating if the vault is connected to the VaultHub.
- `wasReportFresh`: Boolean indicating if the report was already fresh before the operation.
- `reportSubmitted`: Boolean indicating if a new report was submitted.
- `reportTxHash`: The transaction hash of the report submission (`null` if skipped).
- `canFinalize`: Boolean indicating if withdrawals could be finalized (based on simulation).
- `finalizationRequested`: Boolean indicating if the finalization step was attempted.
- `finalizationTxHash`: The transaction hash of the withdrawal finalization (`null` if skipped).
- `totalUnfinalizedRequests`: The total number of unfinalized requests before the operation.
- `totalUnfinalizedAssets`: The total value of unfinalized assets (in wei) before the operation.
- `requestsFinalized`: The number of withdrawal requests that were finalized in the run.
- `assetsFinalized`: The total value of assets (in wei) that were finalized in the run.

**Example:**

```bash
# Start the auto-report process with a callback URL
yarn start dw uc wo w auto-report 0x... \
  --callback-url https://my-monitoring-service.com/webhook
```

**Use Case:** Automate the entire report submission and withdrawal finalization lifecycle for a wrapper pool, with optional notifications to an external service. This is a "set it and forget it" command for pool operators.

## Troubleshooting

### Transaction Fails

**Possible Causes:**

- Insufficient gas
- Invalid configuration parameters
- Network congestion
- Lack of required permissions (for privileged operations)

**Solutions:**

- Increase gas limit in wallet
- Verify all parameters are correct
- Retry during lower network usage
- Ensure the executing account has the necessary roles.

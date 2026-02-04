---
sidebar_position: 2
---

# Creating a New Wrapper

The CLI provides a powerful set of commands to deploy and configure new DeFi wrappers. This process involves creating a new staking pool, which can be of several types depending on the desired functionality. The primary commands for this are under `defi-wrapper contracts factory write`.

## Deployment Commands

There are three main commands to initiate the deployment of a new wrapper, each corresponding to a different pool type:

- `create-pool-stv`: Deploys a standard STV (Staking Vault) pool.
- `create-pool-stv-steth`: Deploys an STV-stETH pool, which includes minting capabilities.
- `create-pool-custom`: Deploys a pool with a custom configuration, allowing for greater flexibility.
- `create-pool-finalize`: Finalizes unfinished deployment of the pool

The deployment process is handled automatically by the CLI, which executes two transactions sequentially:

1.  **Initiation**: The first transaction starts the deployment on-chain.
2.  **Finalization**: The second transaction finalizes the configuration and connects all the components of the wrapper. If this step is skipped due, process can be manually continued with `create-pool-finalize`

The CLI orchestrates this process. However, if the second transaction is not automatically sent (for example, due to a network issue or if the first transaction is sent via a multisig that needs time for confirmation), you may need to finalize it manually. The output from the initial command will provide the necessary data and instructions to do so.

## Deployment Output

Upon successful completion, the CLI will output a comprehensive summary of the deployment. This includes:

- **All Deployed Addresses**: A list of all newly created contract addresses, such as the `Vault`, `Pool`, `WithdrawalQueue`, and `Timelock`.
- **UI Environment Variables**: A set of environment variables (e.g., `VITE_POOL_ADDRESS`, `VITE_POOL_TYPE`) that can be directly used to configure a front-end application.

## Common Deployment Options

All `create-pool-*` commands share a comprehensive set of common options that allow for detailed configuration of the new vault, its governance, and the associated pool.

| Option                     | Argument         | Description                                                                  |
| -------------------------- | ---------------- | ---------------------------------------------------------------------------- |
| `--nodeOperator`           | `<address>`      | The address of the node operator managing the vault.                         |
| `--nodeOperatorManager`    | `<address>`      | The address authorized to manage node operator settings.                     |
| `--nodeOperatorFeeRateBP`  | `<number>`       | The node operator's fee rate in basis points (e.g., `100` for 1%).           |
| `--confirmExpiry`          | `<seconds>`      | The time period in seconds for confirmation expiry.                          |
| `--minDelaySeconds`        | `<seconds>`      | The minimum delay in seconds before a `TimeLock` operation can be executed.  |
| `--minWithdrawalDelayTime` | `<seconds>`      | The minimum delay time for processing withdrawals from the pool.             |
| `--name`                   | `<string>`       | The name for the pool's ERC20 share token (e.g., "My Vault Shares").         |
| `--symbol`                 | `<string>`       | The symbol for the pool's ERC20 share token (e.g., "MVS").                   |
| `--proposer`               | `<address>`      | The address authorized to propose `TimeLock` operations.                     |
| `--executor`               | `<address>`      | The address authorized to execute `TimeLock` operations.                     |
| `--emergencyCommittee`     | `<address>`      | The address of the emergency committee, which can pause critical operations. |
| `--skip-simulation`        | `true` / `false` | If `true`, skips the transaction simulation step before sending.             |
| `--simulation-only`        | `true` / `false` | If `true`, only performs the simulation without sending the transaction.     |
| `--skip-finalization`      | `true` / `false` | If `true`, only performs first step of creation                              |

---

## Pool-Specific Options

### `create-pool-stv`

This command deploys a standard STV staking pool.

**Command:**

```bash
yarn start dw c f w create-pool-stv <factory-address> [options]
```

**Specific Options:**
| Option | Argument | Description |
| ---------------------- | ---------------- | ---------------------------------------------------- |
| `--allowList` | `true` / `false` | Enables or disables an allowlist for deposits. |
| `--allowListManager` | `<address>` | The address that can manage the allowlist. |

### `create-pool-stv-steth`

This command deploys an STV-stETH pool with minting enabled.

**Command:**

```bash
yarn start dw c f w create-pool-stv-steth <factory-address> [options]
```

**Specific Options:**
| Option | Argument | Description |
| ---------------------- | ---------------- | ------------------------------------------------------------------------ |
| `--reserveRatioGapBP` | `<number>` | The reserve ratio gap in basis points. |
| `--allowList` | `true` / `false` | Enables or disables an allowlist for deposits. |
| `--allowListManager` | `<address>` | The address that can manage the allowlist. |

### `create-pool-custom`

This command allows for the deployment of a pool with a highly customized configuration.

**Command:**

```bash
yarn start dw c f w create-pool-custom <factory-address> [options]
```

**Specific Options:**
| Option | Argument | Description |
| ------------------------------ | ---------------- | ------------------------------------------------------------------------ |
| `--reserveRatioGapBP` | `<number>` | The reserve ratio gap in basis points. |
| `--allowList` | `true` / `false` | Enables or disables an allowlist for deposits. |
| `--allowListManager` | `<address>` | The address that can manage the allowlist. |
| `--mintingEnabled` | `true` / `false` | Enables or disables minting capabilities for the pool. |
| `--strategyFactory` | `<address>` | The address of a custom strategy factory to use for the pool. |
| `--strategyFactoryDeployBytes` | `<hex>` | The deployment bytecode for the custom strategy factory. |

### `create-pool-finalize`

This command allows to manually finalize partial deployment of a pool.
To retrieve finalization results after transaction execution use `yarn start dw c f r log-creating-pool-data <firstStepTxHash> <finalizationTxHash>`

**Command:**

```bash
yarn start dw c f w create-pool-finalize <factory-address> <creationTxHash> [options]
```

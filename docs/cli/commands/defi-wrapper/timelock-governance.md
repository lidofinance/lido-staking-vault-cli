---
sidebar_position: 5
---

# Timelock Governance

## Command

```bash
yarn start dw uc timelock-governance [arguments] [-options]
# or
yarn start dw uc tg [arguments] [-options]
```

## Overview

Timelock Governance commands provide a comprehensive toolkit for interacting with a `TimeLock` contract. These commands allow for scheduling, executing, and canceling time-delayed administrative operations, which is a critical safety feature for protocol governance.

The commands are grouped by the contract they primarily interact with, such as `common`, `dashboard`, `pool`, etc.

## Common Commands

These commands interact directly with the `TimeLock` contract and are not specific to another contract's functionality.

### Read Commands (`common r`)

| Command                | Description                                                 |
| ---------------------- | ----------------------------------------------------------- |
| `get-timelock-address` | Gets the timelock governance address for a given pool.      |
| `get-last-operations`  | Fetches and decodes recent `CallScheduled` events.          |
| `get-operation-state`  | Retrieves the current state of a specific operation.        |
| `get-timestamp`        | Gets the timestamp when an operation will become ready.     |
| `get-min-delay`        | Retrieves the minimum delay for operations.                 |
| `is-operation`         | Checks if a given ID corresponds to a registered operation. |
| `is-operation-pending` | Checks if an operation is either 'Waiting' or 'Ready'.      |
| `is-operation-ready`   | Checks if an operation is ready for execution.              |
| `is-operation-done`    | Checks if an operation has been executed.                   |
| `get-operation-info`   | Gets comprehensive information about a specific operation.  |

### Write Commands (`common w`)

| Command   | Description                              |
| --------- | ---------------------------------------- |
| `execute` | Executes a generic, scheduled operation. |
| `cancel`  | Cancels a scheduled timelock operation.  |

---

## Command Details

### `get-timelock-address`

Finds the admin of a given pool, which is expected to be the `TimeLock` contract.

**Arguments:**

- `[pool]`: The contract address of the pool.

### `get-last-operations`

Scans recent blocks for `CallScheduled` events on the timelock contract and displays detailed, decoded information for each, including the target function and arguments.

**Arguments:**

- `[timelock]`: The address of the `TimeLock` contract.
  **Options:**
- `-n, --number <number>`: The number of blocks to look back. Default: `5000`.

### `get-operation-state`

Retrieves the state of an operation (e.g., `Unset`, `Waiting`, `Ready`, `Done`).

**Arguments:**

- `[timelock]`: The address of the `TimeLock` contract.
- `[operation-id]`: The ID of the operation.

### `get-operation-info`

Provides a full report on a specific operation, including its state, ready timestamp, and various status flags (`isPending`, `isReady`, `isDone`).

**Arguments:**

- `[timelock]`: The address of the `TimeLock` contract.
- `[operation-id]`: The ID of the operation.

### `execute`

Executes a scheduled operation by reconstructing its parameters. This is a powerful, generic command that can execute any operation if you provide the correct `target`, `value`, `payload`, and `salt`.

**Arguments:**

- `[timelock]`: The address of the `TimeLock` contract.
- `[target]`: The contract address the operation will call.
- `[value]`: The amount of ETH (in wei) to send with the operation. Default: `0`.
- `[payload]`: The hex-encoded calldata representing the function and arguments to be called on the `target`.
  **Options:**
- `-p, --predecessor <id>`: The ID of a preceding operation that must be completed first.
- `--salt <salt>`: A custom salt for the operation ID.

**Example:**

```bash
# Execute a proposal to grant a role by providing the encoded calldata
yarn start dw uc tg common w execute <timelock-addr> <dashboard-addr> 0 <encoded-grantRole-calldata>
```

### `cancel`

Cancels a scheduled operation. An operation cannot be canceled if it has already been executed.

**Arguments:**

- `[timelock]`: The address of the `TimeLock` contract.
- `[operation-id]`: The ID of the operation to cancel.

---

## Dashboard Commands

These commands are for proposing and executing administrative changes to a `Dashboard` contract through the `TimeLock`.

### Write Commands (`dashboard w`)

Each function on the `Dashboard` contract has a corresponding `propose-` and `execute-` command pair.

| Command                            | Description                                             |
| ---------------------------------- | ------------------------------------------------------- |
| `propose-grant-role`               | Proposes granting a role to an account.                 |
| `execute-grant-role`               | Executes a proposal to grant a role.                    |
| `propose-revoke-role`              | Proposes revoking a role from an account.               |
| `execute-revoke-role`              | Executes a proposal to revoke a role.                   |
| `propose-change-tier`              | Proposes changing a tier's share limit.                 |
| `execute-change-tier`              | Executes a proposal to change a tier.                   |
| `propose-sync-tier`                | Proposes syncing a tier.                                |
| `execute-sync-tier`                | Executes a proposal to sync a tier.                     |
| `propose-update-share-limit`       | Proposes updating the share limit for a tier.           |
| `execute-update-share-limit`       | Executes a proposal to update a share limit.            |
| `propose-set-pdg-policy`           | Proposes setting the PDG (Predeposit Guarantee) policy. |
| `execute-set-pdg-policy`           | Executes a proposal to set the PDG policy.              |
| `propose-transfer-vault-ownership` | Proposes transferring vault ownership.                  |
| `execute-transfer-vault-ownership` | Executes a proposal to transfer vault ownership.        |

### Command Details

All `dashboard` write commands share a similar structure.

**Arguments:**

- `[timelock]`: The address of the `TimeLock` contract.
- `[dashboard]`: The address of the `Dashboard` contract being managed.
- Additional arguments specific to the function being called (e.g., `role`, `account`, `tierId`, `shareLimit`).

**Options:**

- `--salt <salt>`: A custom salt for the operation ID.

**Example (`propose-grant-role`):**

```bash
# Propose granting the FINALIZE_ROLE to a new account
yarn start dw uc tg dashboard w propose-grant-role <timelock-addr> <dashboard-addr> FINALIZE_ROLE <account-addr>
```

**Example (`execute-grant-role`):**

```bash
# Execute the proposal to grant the role
yarn start dw uc tg dashboard w execute-grant-role <timelock-addr> <dashboard-addr> FINALIZE_ROLE <account-addr>
```

---

## Pool Commands

These commands are for proposing and executing administrative changes to a `StvStETHPool` contract through the `TimeLock`.

### Write Commands (`pool w`)

| Command                                 | Description                                              |
| --------------------------------------- | -------------------------------------------------------- |
| `propose-grant-role`                    | Proposes granting a role to an account on the pool.      |
| `execute-grant-role`                    | Executes a proposal to grant a role on the pool.         |
| `propose-revoke-role`                   | Proposes revoking a role from an account on the pool.    |
| `execute-revoke-role`                   | Executes a proposal to revoke a role on the pool.        |
| `propose-set-max-loss-socialization-bp` | Proposes setting the `maxLossSocializationBP`.           |
| `execute-set-max-loss-socialization-bp` | Executes a proposal to set the `maxLossSocializationBP`. |

### Command Details

All `pool` write commands follow a similar pattern.

**Arguments:**

- `[timelock]`: The address of the `TimeLock` contract.
- `[pool]`: The address of the `StvStETHPool` contract being managed.
- Additional arguments specific to the function being called (e.g., `role`, `account`, `maxSocializablePortionBP`).

**Options:**

- `--salt <salt>`: A custom salt for the operation ID.

**Example (`propose-set-max-loss-socialization-bp`):**

```bash
# Propose setting the max loss socialization to 100 basis points (1%)
yarn start dw uc tg pool w propose-set-max-loss-socialization-bp <timelock-addr> <pool-addr> 100
```

**Example (`execute-set-max-loss-socialization-bp`):**

```bash
# Execute the proposal to set the max loss socialization
yarn start dw uc tg pool w execute-set-max-loss-socialization-bp <timelock-addr> <pool-addr> 100
```

---

## Proxy Commands

These commands are for proposing and executing upgrades to `OssifiableProxy` contracts through the `TimeLock`. This is a critical part of contract maintenance and evolution.

### Write Commands (`proxy w`)

| Command                       | Description                                                            |
| ----------------------------- | ---------------------------------------------------------------------- |
| `propose-upgrade-to`          | Proposes a simple upgrade to a new implementation contract.            |
| `execute-upgrade-to`          | Executes a simple implementation upgrade.                              |
| `propose-upgrade-to-and-call` | Proposes an upgrade that also includes an initialization (setup) call. |
| `execute-upgrade-to-and-call` | Executes an upgrade with an initialization call.                       |

### Command Details

All `proxy` write commands follow a similar pattern for proposing and executing changes.

**Arguments:**

- `[timelock]`: The address of the `TimeLock` contract.
- `[proxy]`: The address of the `OssifiableProxy` contract to be upgraded.
- `[newImplementation]`: The address of the new implementation contract.
- `[setupCalldata]` (for `...-and-call` commands): The hex-encoded calldata for the initialization function to be called on the new implementation.

**Options:**

- `--salt <salt>`: A custom salt for the operation ID.

**Example (`propose-upgrade-to-and-call`):**

```bash
# Propose upgrading a proxy and calling an initializer function
yarn start dw uc tg proxy w propose-upgrade-to-and-call <timelock-addr> <proxy-addr> <impl-addr> <calldata>
```

**Example (`execute-upgrade-to-and-call`):**

```bash
# Execute the proxy upgrade with the initialization call
yarn start dw uc tg proxy w execute-upgrade-to-and-call <timelock-addr> <proxy-addr> <impl-addr> <calldata>
```

---

## Withdrawal Queue Commands

These commands are for proposing and executing administrative changes to a `WithdrawalQueue` contract through the `TimeLock`.

### Write Commands (`withdrawal-queue w`)

| Command               | Description                                            |
| --------------------- | ------------------------------------------------------ |
| `propose-grant-role`  | Proposes granting a role to an account on the queue.   |
| `execute-grant-role`  | Executes a proposal to grant a role on the queue.      |
| `propose-revoke-role` | Proposes revoking a role from an account on the queue. |
| `execute-revoke-role` | Executes a proposal to revoke a role on the queue.     |

### Command Details

All `withdrawal-queue` write commands follow a similar pattern for proposing and executing role changes.

**Arguments:**

- `[timelock]`: The address of the `TimeLock` contract.
- `[withdrawalQueue]`: The address of the `WithdrawalQueue` contract being managed.
- `[role]`: The role to grant or revoke (e.g., `FINALIZE_ROLE`).
- `[account]`: The account address to grant or revoke the role for.

**Options:**

- `--salt <salt>`: A custom salt for the operation ID.

**Example (`propose-grant-role`):**

```bash
# Propose granting the FINALIZE_ROLE to a new operator
yarn start dw uc tg withdrawal-queue w propose-grant-role <timelock-addr> <wq-addr> FINALIZE_ROLE <operator-addr>
```

**Example (`execute-grant-role`):**

```bash
# Execute the proposal to grant the role
yarn start dw uc tg withdrawal-queue w execute-grant-role <timelock-addr> <wq-addr> FINALIZE_ROLE <operator-addr>
```

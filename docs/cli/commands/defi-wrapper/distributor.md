---
sidebar_position: 4
---

# Distributor

## Command

```bash
yarn start dw uc distributor [arguments] [-options]
# or
yarn start dw uc d [arguments] [-options]
```

## Distributor commands list

```bash
yarn start dw uc d -h
```

## Overview

The Distributor commands are used to manage the distribution of side tokens via a Merkle Tree. This allows for efficient and secure distribution of rewards to a large number of recipients.

## API

| Command   | Description    |
| --------- | -------------- |
| read (r)  | read commands  |
| write (w) | write commands |

### Read

| Command | Description                    |
| ------- | ------------------------------ |
| state   | show current distributor state |

### Write

| Command         | Description                                             |
| --------------- | ------------------------------------------------------- |
| add-token       | add a new token to distribute                           |
| set-merkle-root | updates merkle root and CID on the distributor contract |
| distribute      | generates and optionally uploads new distribution data  |
| claim           | permissionlessly claim rewards to recipients            |

## Command Details

### state

Displays a comprehensive overview of the Distributor contract's current state, including roles, configuration, and token balances.

**Arguments:**

- `<pool address>`: The contract address of the pool.

**Information Displayed:**

- **Distributor Address**: The address of the Distributor contract.
- **Pool Address**: The address of the associated pool contract.
- **Admins**: The count and list of addresses with the `DEFAULT_ADMIN_ROLE`.
- **Managers**: The count and list of addresses with the `MANAGER_ROLE`.
- **Tokens Supported**: The count and list of supported reward tokens. For each token, it shows:
  - Token Address
  - Name and Symbol
  - Current balance in the distributor contract (formatted and in wei)
  - Decimals
- **CID**: The IPFS Content ID of the current distribution data.
- **Merkle Root**: The current Merkle root.
- **Last Processed Block**: The block number up to which rewards have been calculated.

**Example:**

```bash
# Get the full state of the distributor for a given pool
yarn start dw uc d r state 0x...
```

**Use Case:** To get a complete and detailed picture of the distributor's configuration, permissions, and current token holdings. This is useful for auditing and debugging.

### add-token

Adds a new ERC20 token to the list of tokens that can be distributed. This is a privileged operation.

**Arguments:**

- `<pool address>`: The contract address of the pool.
- `<token address>`: The contract address of the ERC20 token to add.

**Example:**

```bash
# Add a new token to the distributor
yarn start dw uc d w add-token 0x... 0x...
```

**Use Case:** To enable rewards distribution for a new type of token.

### set-merkle-root

Updates the Merkle root and associated IPFS CID on the Distributor contract. This is a privileged operation that points the contract to a new set of distribution data.

**Arguments:**

- `<pool address>`: The contract address of the pool.
- `<merkle root>`: The new Merkle root hash.
- `<cid>`: The IPFS Content ID (CID) of the file containing the distribution data.

**Example:**

```bash
# Update the merkle root and CID
yarn start dw uc d w set-merkle-root 0x... 0x... Qm...
```

**Use Case:** To activate a new rewards distribution after the distribution data has been generated and uploaded to IPFS.

### distribute

Generates a new rewards distribution based on pool shares, and provides options to automate the entire process from data generation to on-chain updates.

**Arguments:**

- `<pool address>`: The contract address of the pool.
- `<tokens...>`: A list of token addresses and the total amount to be distributed for each, e.g., `0xtoken1... 1000 0xtoken2... 500.5`.

**Options:**

| Option                           | Description                                                                                                                                                              | Default                             |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- |
| `--blacklist [addresses...]`     | A list of addresses to exclude from the distribution.                                                                                                                    | `[]`                                |
| `--mode [mode]`                  | distribution calculation mode, `integral` or `snapshot`. `integral` mode calculates based on historical holding share while `snapshot` calculates by balances on toBlock | `integral`                          |
| `--from-block [block]`           | The starting block for calculating pool share balances.                                                                                                                  | `undefined`                         |
| `--to-block [block]`             | The ending block for calculating pool share balances.                                                                                                                    | `undefined`                         |
| `--max-batch-size [size]`        | The maximum number of blocks to fetch events for in a single batch.                                                                                                      | `50000`                             |
| `--output-path [path]`           | The local file path to save the generated distribution data.                                                                                                             | `./distribution-[merkle-root].json` |
| `--skip-write`                   | If set, the distribution data will not be written to a local file.                                                                                                       | `false`                             |
| `--skip-transfer`                | If set, the command will not attempt to transfer the reward tokens to the distributor contract.                                                                          | `false`                             |
| `--ipfs-gateway [gateway]`       | A custom IPFS gateway to fetch previous distribution data from.                                                                                                          | `undefined`                         |
| `--upload [pinningUrl]`          | (unstable) uploading distribution data to provided pinning service URL                                                                                                   | `undefined`                         |
| `--upload-authorization [token]` | Authorization token for uploading distribution data to pinning service, used as `Authorization: Bearer <token>`                                                          | `undefined`                         |
| `--skip-set-root`                | If set, the new Merkle root will not be set on the distributor contract.                                                                                                 | `false`                             |

**Example:**

```bash
# Generate a new distribution for two tokens, upload it to a pinning service, and update the contract
yarn start dw uc d w distribute 0x... 0xtoken1... 1000 0xtoken2... 500.5 --upload https://my-pinning-service.com/
```

**Use Case:** To perform a complete rewards distribution run. This command can calculate rewards, generate the necessary data, upload it to IPFS, and update the smart contract all in one go, making it a powerful tool for automating rewards distribution.

### claim

Allows to permissionlessly claim distributed tokens to set or all recipients.

**Arguments:**

- `<pool address>`: The contract address of the pool.
- `--recipients [addresses...]`: (optional) The addresses(space separated) of the recipients to claim the distributed tokens for, if not provided, all recipients will be claimed.
- `--tokens [addresses]`: (optional) The addresses(space separated) of the tokens to claim, if not provided, all tokens in the distribution will be claimed.
- `--ipfs-gateway [gateway]`: (optional) A custom IPFS gateway to fetch distribution data from, if not provided, the default gateway will be used.
- `--print-only`: (optional) If set, the claim data will be printed to the console without sending any transactions.

**Example:**

```bash
# distribute rewards to specific recipients for specific tokens
yarn start dw uc d w claim 0x<poolAddress>  --recipients 0x<recipientAddress1> 0x<recipientAddress2> --tokens 0x<tokenAddress1> 0x<tokenAddress2>
```

**Use Case:** Manually claim personal rewards or force claim for all recipients

---
sidebar_position: 1
title: Introduction
slug: /
---

**Lido Staking Vault CLI** is a command-line interface (CLI) tool for managing lido staking vaults. Simplify your staking operations with intuitive commands and streamlined workflows.

## Changelog

For changes between versions see [Changelog](./changelog.mdx)

## Features

- **Easy Setup**: Quick installation and configuration to get you started.
- **Vault Management**: Create, update, and delete staking vaults with simple commands.
- **Monitoring**: Track vault metrics.

## Prerequisites

- **Node.js**: Ensure you have Node.js (v20 or later) installed.
- **npm**: Node Package Manager is required to install dependencies.

## Installation

Install the Lido Staking Vault CLI globally using npm:

```bash
npm install -g @lidofinance/lsv-cli
```

Alternatively, you can install it locally in your project:

```bash
npm install @lidofinance/lsv-cli
```

## Configuration

Before using the CLI, configure your environment variables. You can set them in a `.env` file in your project root.

```.env
RPC_URL_17000=
RPC_URL_1=

# Contract addresses
DEPLOYED=deployed-holesky-vaults-devnet-0.json
CONFIG=./config.json

# Wallet
PRIVATE_KEY_1=0x...
PRIVATE_KEY_17000=0x...

```

Application supported a few ways to adding or combine different settings

- #### 1st step
  You can pass link to json file with address of deployed contacts into **DEPLOYED** variable. If you want use
  devnet the all needed addresses of the contracts like VaultHub, VaultFactory etc already passed as example in configs/deployed-holesky-vaults-devnet-1.json.
  Also at near future this feature will be changed to resolving contracts addresses by LIDO locator and link to json
  file will no longer be necessary
- #### 2nd step
  You need to pass link to json config file into **CONFIG** variable. The structure of a config file has to be like
  ```javascript
  {
    "rpcLink": "https://link_to_rpc",
    "privateKey": "some_key",
    "chainId": 1, // or another number of chain id
    "lidoLocator": "LIDO locator address", // take LIDO locator address in paticular chainId
    "accounting": "LIDO accountind address" // take LIDO accounting address in paticular chainId
    "clLink": "url" // CL url
  }
  ```
  If you plan to manage contracts the **privateKey** is required property for this type of operations.
  For using rpcLink in a right way be attentive to match rpc resolver link and its chain ID.
  Also, You can pass rpc link as env variable into RPC*URL*(chainID)
  where chainID is current chain ID, chainId basically takes from config file, but also you can
  pass it to deployed file and process env CHAIN_ID variable.

## Usage

After installation and configuration, you can start using the CLI to manage your staking vaults.

```bash
lsv-cli [command] [options]
```

```bash
lsv-cli -h
```

### Examples

**VaultHub constants**

```bash
lsv-cli hub constants
```

**Count of all vaults**

```bash
lsv-cli hub v-count
```

## Documentation

For additional information about available methods and functionality, refer to the [the documentation for the Lido Ethereum SDK](/category/modules).

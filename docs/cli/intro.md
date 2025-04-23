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

### Clone from repository

```bash
git clone git@github.com:lidofinance/lido-staking-vault-cli.git
```

## Configuration

Before using the CLI, configure your environment variables. You can set them in a `.env` file in your project root.

```.env
CHAIN_ID=560048 // required
CL_URL=url
EL_URL=url

# Contract addresses
DEPLOYED=deployed-hoodi-vaults-testnet.json // required

# Wallet
PRIVATE_KEY=0x
```

If you plan to manage contracts the **PRIVATE_KEY** is required property for this type of operations.
For using **EL_URL** in a right way be attentive to match rpc resolver link and its chain ID.

## Usage

After installation and configuration, you can start using the CLI to manage your staking vaults.

### Repository

```bash
yarn start [command] [options]
```

```bash
yarn start -h
```

### Examples

**VaultHub constants**

```bash
yarn start hub r info
```

**Count of all vaults**

```bash
yarn start hub r v-count
```

## Documentation

For additional information about available methods and functionality, refer to the [the documentation for the Lido Ethereum SDK](/category/commands).

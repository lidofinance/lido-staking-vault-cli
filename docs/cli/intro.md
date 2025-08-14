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
- **Vault Management**: Create, manage staking vaults with simple commands.
- **Monitoring**: Track vault metrics.
- **WalletConnect Support**: Sign transactions securely using your mobile/desktop wallet without exposing private keys.

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
DEPLOYED=deployed-hoodi-vaults-testnet-2.json // required

# Wallet (choose one method)
PRIVATE_KEY=0x

# or encrypted file
# ACCOUNT_FILE=wallets/account.json
# ACCOUNT_FILE_PASSWORD=1234

# or WalletConnect (recommended for secure signing)
# WALLET_CONNECT_PROJECT_ID is NOT a secret - it's a public app identifier
WALLET_CONNECT_PROJECT_ID=ee928c025792b10a6daa97d85328c433
```

**Wallet Configuration Options:**

- **Private Key**: Direct key configuration (development/testing)
- **Encrypted File**: Secure keystore file (recommended for local use)
- **WalletConnect**: Sign with external wallet (recommended for secure signing)

If you plan to manage contracts and use private key/encrypted file methods, ensure the wallet has sufficient ETH for gas fees.
To use **EL_URL** correctly, ensure the RPC endpoint matches the configured chain ID.

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
yarn start vo r info
```

**Count of all vaults**

```bash
yarn start contracts hub r v-count
```

**Using WalletConnect for secure transaction signing**

```bash
# Add --wallet-connect flag to any write command
yarn start report w submit --wallet-connect
```

## Documentation

For additional information about available methods and functionality, refer to the [documentation for the Lido Staking Vault CLI](/category/commands).

### Key Topics

- [Configuration Guide](./get-started/configuration.md) - Environment setup and wallet configuration
- [WalletConnect Setup](./get-started/wallet-connect.md) - Secure transaction signing with external wallets
- [Commands Reference](/category/commands) - Complete CLI commands documentation

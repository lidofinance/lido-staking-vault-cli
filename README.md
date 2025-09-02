# Lido Staking Vault CLI

A command-line interface (CLI) tool for managing Lido staking vaults. Simplify your staking operations with intuitive commands and streamlined workflows.

## Changelog

For changes between versions see [Changelog](./CHANGELOG.md)

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
  - [Examples](#examples)
- [Programs](#programs)
- [Documentation](#documentation)
- [License](#license)

## Features

- **Easy Setup**: Quick installation and configuration to get you started.
- **Vault Management**: Create and manage staking vaults with simple commands.
- **Monitoring**: Track vault metrics.

## Prerequisites

- **Node.js**: Ensure you have Node.js (v20 or later) installed.
- **npm**: Node Package Manager is required to install dependencies.

## Installation

### From Source

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

# Wallet
PRIVATE_KEY=0x

# or encrypted file
# ACCOUNT_FILE=wallets/account.json
# ACCOUNT_FILE_PASSWORD=1234

# WalletConnect (optional)
# Note: WALLET_CONNECT_PROJECT_ID is NOT a secret. It is a public identifier
# of the application using WalletConnect.
WALLET_CONNECT_PROJECT_ID=ee928c025792b10a6daa97d85328c433
```

If you plan to manage contracts, the **privateKey** is a required property for this type of operations.
For using elLink in the right way, be attentive to match the RPC resolver link and its chain ID.

## Usage

After installation and configuration, you can start using the CLI to manage your staking vaults.

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

## Programs

- [Get Started](https://lidofinance.github.io/lido-staking-vault-cli/category/get-started)
- [Account](https://lidofinance.github.io/lido-staking-vault-cli/commands/account)
- [Vault Operations](https://lidofinance.github.io/lido-staking-vault-cli/commands/vault-operations)
- [Deposits](https://lidofinance.github.io/lido-staking-vault-cli/commands/deposits)
- [Metrics](https://lidofinance.github.io/lido-staking-vault-cli/commands/metrics)
- [Report](https://lidofinance.github.io/lido-staking-vault-cli/commands/report)
- [PredepositGuarantee Helpers](https://lidofinance.github.io/lido-staking-vault-cli/commands/pdg-helpers)
- Contracts:
  - [Dashboard](https://lidofinance.github.io/lido-staking-vault-cli/commands/contracts/dashboard)
  - [OperatorGrid](https://lidofinance.github.io/lido-staking-vault-cli/commands/contracts/operator-grid)
  - [PredepositGuarantee](https://lidofinance.github.io/lido-staking-vault-cli/commands/contracts/predeposit-guarantee)
  - [VaultFactory](https://lidofinance.github.io/lido-staking-vault-cli/commands/contracts/vault-factory)
  - [VaultHub](https://lidofinance.github.io/lido-staking-vault-cli/commands/contracts/vault-hub)
  - [VaultViewer](https://lidofinance.github.io/lido-staking-vault-cli/commands/contracts/vault-viewer)
  - [Vault](https://lidofinance.github.io/lido-staking-vault-cli/commands/contracts/vault)

## Documentation

For additional information about available methods and functionality, refer to [the documentation for the Lido Staking Vault CLI](https://lidofinance.github.io/lido-staking-vault-cli/).

## License

This project is licensed under the [MIT License](LICENSE).

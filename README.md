# Lido Staking Vault CLI

A command-line interface (CLI) tool for managing lido staking vaults. Simplify your staking operations with intuitive commands and streamlined workflows.

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
- [License](#license)

## Features

- **Easy Setup**: Quick installation and configuration to get you started.
- **Vault Management**: Create, update, and delete staking vaults with simple commands.
- **Monitoring**: Track vault metrics.

## Prerequisites

- **Node.js**: Ensure you have Node.js (v20 or later) installed.
- **npm**: Node Package Manager is required to install dependencies.

## Installation

### NPM

Install the Lido Staking Vault CLI globally using npm:

```bash
npm install -g @lidofinance/lsv-cli
```

Alternatively, you can install it locally in your project:

```bash
npm install @lidofinance/lsv-cli
```

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

If you plan to manage contracts the **privateKey** is required property for this type of operations.
For using elLink in a right way be attentive to match rpc resolver link and its chain ID.

## Usage

After installation and configuration, you can start using the CLI to manage your staking vaults.

### NPM

```bash
lsv-cli [command] [options]
```

```bash
lsv-cli -h
```

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
lsv-cli hub constants
```

**Count of all vaults**

```bash
lsv-cli hub v-count
```

## Programs

- [Account](https://lidofinance.github.io/lido-staking-vault-cli/commands/account)
- [VaultHub](https://lidofinance.github.io/lido-staking-vault-cli/commands/vault-hub)
- [VaultFactory](https://lidofinance.github.io/lido-staking-vault-cli/commands/vault-factory)
- [Vault](https://lidofinance.github.io/lido-staking-vault-cli/commands/vault)
- [Dashboard](https://lidofinance.github.io/lido-staking-vault-cli/commands/dashboard)
- [PredepositGuarantee](https://lidofinance.github.io/lido-staking-vault-cli/commands/predeposit-guarantee)
- [OperatorGrid](https://lidofinance.github.io/lido-staking-vault-cli/commands/operator-grid)
- [VaultViewer](https://lidofinance.github.io/lido-staking-vault-cli/commands/vault-viewer)

## Documentation

For additional information about available methods and functionality, refer to the [the documentation for the Lido Staking Vault CLI](https://lidofinance.github.io/lido-staking-vault-cli/).

## License

This project is licensed under the [MIT License](LICENSE).

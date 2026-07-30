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
- **Yarn**: Yarn package manager is required to install dependencies.

## Installation

### From Source

```bash
git clone git@github.com:lidofinance/lido-staking-vault-cli.git
cd lido-staking-vault-cli
yarn install
```

### Branch Selection

The repository has two primary branches:

- **`main`** (Recommended): Stable releases with tested and verified features. Ideal for production use and reliable operations.
- **`develop`**: Active development branch with the latest features. Use this if you want immediate access to new functionality and can handle potentially unstable features.

```bash
# Switch to stable branch (recommended)
git checkout main

# Or switch to development branch for latest features
git checkout develop
```

## Configuration

Before using the CLI, configure your environment variables. You can set them in a `.env` file in your project root.

```env
# Network Configuration (Required)
CHAIN_ID=560048
CL_URL=https://your-consensus-layer-endpoint
EL_URL=https://your-execution-layer-endpoint

# Contract addresses (Required)
DEPLOYED=deployed-hoodi-vaults.json

# Wallet
PRIVATE_KEY=0x

# or encrypted file
# ACCOUNT_FILE=wallets/account.json
# ACCOUNT_FILE_PASSWORD=1234

# WalletConnect (optional)
# Note: WALLET_CONNECT_PROJECT_ID is NOT a secret. It is a public identifier
# of the application using WalletConnect.
WALLET_CONNECT_PROJECT_ID=ee928c025792b10a6daa97d85328c433

# IPFS (optional)
# Maximum size, in bytes, of content fetched from an IPFS gateway. Oversized
# objects are rejected before they are buffered into memory, guarding against
# out-of-memory DoS from a hostile or mistaken CID. Defaults to 20 MiB
# (20971520). Applications embedding the CLI as a package can also override
# this per call via the `maxBytes` argument of the fetch helpers.
# IPFS_MAX_CONTENT_BYTES=20971520
```

If you plan to manage contracts, **PRIVATE_KEY** (or an encrypted account file) is required for write operations.
Ensure your **EL_URL** matches the configured **CHAIN_ID**.

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
- [Global Flags](https://lidofinance.github.io/lido-staking-vault-cli/commands/global-flags)
- [Account](https://lidofinance.github.io/lido-staking-vault-cli/commands/account)
- [Vault Operations](https://lidofinance.github.io/lido-staking-vault-cli/commands/vault-operations)
- [Deposits](https://lidofinance.github.io/lido-staking-vault-cli/commands/deposits)
- [Metrics](https://lidofinance.github.io/lido-staking-vault-cli/commands/metrics)
- [Report](https://lidofinance.github.io/lido-staking-vault-cli/commands/report)
- [Consolidation](https://lidofinance.github.io/lido-staking-vault-cli/commands/consolidation)
- [PredepositGuarantee Helpers](https://lidofinance.github.io/lido-staking-vault-cli/commands/pdg-helpers)
- Contracts:
  - [Dashboard](https://lidofinance.github.io/lido-staking-vault-cli/commands/contracts/dashboard)
  - [LazyOracle](https://lidofinance.github.io/lido-staking-vault-cli/commands/contracts/lazy-oracle)
  - [OperatorGrid](https://lidofinance.github.io/lido-staking-vault-cli/commands/contracts/operator-grid)
  - [PredepositGuarantee](https://lidofinance.github.io/lido-staking-vault-cli/commands/contracts/predeposit-guarantee)
  - [VaultFactory](https://lidofinance.github.io/lido-staking-vault-cli/commands/contracts/vault-factory)
  - [VaultHub](https://lidofinance.github.io/lido-staking-vault-cli/commands/contracts/vault-hub)
  - [VaultViewer](https://lidofinance.github.io/lido-staking-vault-cli/commands/contracts/vault-viewer)
  - [Vault](https://lidofinance.github.io/lido-staking-vault-cli/commands/contracts/vault)
- [DeFi Wrapper](https://lidofinance.github.io/lido-staking-vault-cli/category/defi-wrapper)

## Testing

### Unit Tests

Run unit tests for utilities and helpers:

```bash
yarn test
```

### Integration Tests

Integration tests run on a forked chain to test real contract interactions.

#### Setup

1. Install dependencies (includes Anvil via `@viem/anvil`):

   ```bash
   yarn install
   ```

2. Create test configuration:
   ```bash
   cp env.test.example .env.test
   # Edit .env.test and set your RPC_URL
   ```

#### Running Tests

Anvil starts automatically when you run tests:

```bash
# All integration tests (Anvil starts automatically)
yarn test:integration

# Watch mode
yarn test:integration:watch
```

For detailed information, see [tests/integration/README.md](tests/integration/README.md).

## Documentation

For additional information about available methods and functionality, refer to [the documentation for the Lido Staking Vault CLI](https://lidofinance.github.io/lido-staking-vault-cli/).

## License

This project is licensed under the [MIT License](LICENSE).

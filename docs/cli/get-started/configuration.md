---
title: Configuration
description: Configure your environment variables and wallet settings
sidebar_position: 1
---

# Configuration

Before using the Lido Staking Vault CLI, you need to configure your environment variables and wallet settings. This guide covers all necessary configuration steps to get started.

## Installation

### From npm (Recommended)

Install the CLI globally to use the `lsv-cli` command anywhere:

```bash
# Using npm
npm install -g @lidofinance/lsv-cli

# Using yarn
yarn global add @lidofinance/lsv-cli
```

After installation, you can run the CLI directly:

```bash
lsv-cli [command] [options]
lsv-cli -h
```

Alternatively, you can run it without a global install using `npx`:

```bash
npx @lidofinance/lsv-cli [command] [options]
```

### Clone from Repository

```bash
git clone git@github.com:lidofinance/lido-staking-vault-cli.git
cd lido-staking-vault-cli
```

### Choosing a Branch

The repository maintains two primary branches:

- **`main`** (Recommended): Stable, tested, and production-ready releases. Use this branch for reliable operation with verified features.
- **`develop`**: Latest features and ongoing development. Choose this branch if you want access to cutting-edge functionality and are comfortable with potentially unstable features.

```bash
# For stable releases (recommended)
git checkout main

# For latest features in development
git checkout develop
```

### Install Dependencies

After cloning and selecting your branch, install dependencies:

```bash
yarn install
```

## Environment Variables

Configure your environment by creating a `.env` file in your project root:

```env
# Network Configuration (Required)
CHAIN_ID=560048
CL_URL=https://your-consensus-layer-endpoint
EL_URL=https://your-execution-layer-endpoint

# Contract Deployment Configuration (Required)
DEPLOYED=deployed-hoodi-vaults.json

# Wallet Configuration (Choose one method)
# use private key
PRIVATE_KEY=0x1234567890abcdef...

# OR use encrypted account file
ACCOUNT_FILE=wallets/account.json
ACCOUNT_FILE_PASSWORD=your_secure_password

# OR use WalletConnect
# WALLET_CONNECT_PROJECT_ID is NOT a secret. It is a public identifier
# of the application that uses WalletConnect.
WALLET_CONNECT_PROJECT_ID=ee928c025792b10a6daa97d85328c433
```

## Configuration Options

### Network Configuration

**CHAIN_ID** (Required)

- Ethereum network chain ID
- Common values:
  - `1`: Ethereum Mainnet
  - `560048`: Hoodi Testnet

**CL_URL** (Required for validator operations)

- Consensus Layer (Beacon Chain) RPC endpoint
- Required for validator proof generation, beacon chain queries, and deposit operations
- Must support the Beacon API specification

**EL_URL** (Required)

- Execution Layer RPC endpoint
- Must match the configured CHAIN_ID
- Used for all contract interactions and transaction broadcasting

### Contract Configuration

**DEPLOYED** (Required)

- JSON file containing deployed contract addresses
- Available configurations:
  - `deployed-mainnet-vaults.json`: Mainnet
  - `deployed-hoodi-vaults.json`: Hoodi testnet
  - Custom deployment files for other networks

### Wallet Configuration

Choose one of the following wallet configuration methods:

#### Method 1: Private Key (Development)

```env
PRIVATE_KEY=0x1234567890abcdef...
```

- Direct private key configuration
- **Security Warning**: Not recommended for production
- Suitable for development and testing environments

#### Method 2: Encrypted Account File (Recommended)

```env
ACCOUNT_FILE=wallets/account.json
ACCOUNT_FILE_PASSWORD=your_secure_password
```

- Uses encrypted keystore file
- More secure than plain private keys
- Compatible with standard Ethereum wallet formats

#### Method 3: WalletConnect (Recommended for signing in external wallet)

```env
WALLET_CONNECT_PROJECT_ID=ee928c025792b10a6daa97d85328c433
```

- Works with mobile/desktop wallets via WalletConnect
- WALLET_CONNECT_PROJECT_ID is a public app identifier (not a secret)
- Enable in commands with the `--wallet-connect` flag

Learn more details in the [WalletConnect Guide](https://lidofinance.github.io/lido-staking-vault-cli/get-started/wallet-connect)

## Validation

After configuration, verify your setup:

```bash
# Check account information (global install)
lsv-cli account r info

# Check account information (from source)
yarn start account r info

# Verify network connectivity (global install)
lsv-cli contracts hub r info

# Verify network connectivity (from source)
yarn start contracts hub r info
```

### Troubleshooting Common Issues

**Invalid Chain ID**

- Ensure CHAIN_ID matches your RPC endpoint
- Verify the network is supported by your configuration

**Account Not Found**

- Check PRIVATE_KEY format (must start with 0x)
- Verify ACCOUNT_FILE path and password
- Ensure wallet has sufficient ETH for gas fees

**Contract Address Not Found**

- Verify DEPLOYED file exists and contains valid addresses
- Check if contracts are deployed on your target network
- Ensure file format matches expected JSON structure

**RPC Connection Issues**

- Test endpoint connectivity outside the CLI
- Verify API key authentication if required
- Check for rate limiting or network restrictions

## Advanced Configuration

### Multiple Environment Management

For managing multiple environments, use separate configuration files:

```bash
# Development
cp .env.example .env.dev

# Testing
cp .env.example .env.test

# Production
cp .env.example .env.prod
```

Load different configurations as needed:

```bash
# Use specific environment
cp .env.test .env
yarn start account r info
```

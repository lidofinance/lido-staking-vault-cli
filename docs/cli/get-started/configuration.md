---
sidebar_position: 1
---

# Configuration

Before using the Lido Staking Vault CLI, you need to configure your environment variables and wallet settings. This guide covers all necessary configuration steps to get started.

## Environment Variables

Configure your environment by creating a `.env` file in your project root:

```env
# Network Configuration (Required)
CHAIN_ID=560048
CL_URL=https://your-consensus-layer-endpoint
EL_URL=https://your-execution-layer-endpoint

# Contract Deployment Configuration (Required)
DEPLOYED=deployed-hoodi-vaults-testnet-2.json

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
  - `560048`: Hoodi Testnet

**CL_URL** (Optional)

- Consensus Layer (Beacon Chain) RPC endpoint
- Required for validator proof generation and beacon chain queries
- Must support the Beacon API specification

**EL_URL** (Optional)

- Execution Layer RPC endpoint
- Must match the configured CHAIN_ID
- Used for contract interactions and transaction broadcasting

### Contract Configuration

**DEPLOYED** (Required)

- JSON file containing deployed contract addresses
- Available configurations:
  - `deployed-hoodi-vaults-testnet-2.json`: Hoodi v2 testnet
  - `deployed-hoodi-vaults-testnet.json`: Hoodi v1 testnet
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
# Check account information
yarn start account r info

# Verify network connectivity
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

---
sidebar_position: 7
---

# Account

## Command

```bash
yarn start account [arguments] [-options]
```

## Account commands list

```bash
yarn start account -h
```

## Overview

Account commands manage user wallet accounts and token allowances for stETH and wstETH tokens. These commands handle key generation, account information retrieval, and approval management for interacting with Lido Staking Vaults.

## API

| Command   | Description    |
| --------- | -------------- |
| read (r)  | read commands  |
| write (w) | write commands |

### Read

| Command                                                              | Description                         |
| -------------------------------------------------------------------- | ----------------------------------- |
| info \<address>                                                      | general account info.               |
| steth-allowance-populate-tx steth-allowance-tx\<address> \<amount>   | populate tx for steth allowance     |
| get-steth-allowance \<address>                                       | get steth allowance for an address  |
| wsteth-allowance-populate-tx wsteth-allowance-tx\<address> \<amount> | populate tx for wsteth allowance    |
| get-wsteth-allowance \<address>                                      | get wsteth allowance for an address |

### Write

| Command                                | Description                                                                         |
| -------------------------------------- | ----------------------------------------------------------------------------------- |
| generate-key                           | generate a new key. Disclaimer: this command is not recommended for production use. |
| generate-encrypted-account \<password> | generate a new encrypted account                                                    |
| steth-allowance \<address> \<amount>   | set allowance for steth contract                                                    |
| wsteth-allowance \<address> \<amount>  | set allowance for wsteth contract                                                   |

## Command Details

### info

Displays comprehensive account information including ETH balance and stETH/wstETH token balances.

**Arguments:**

- `[address]`: Wallet address to check (optional)

**Process:**

- If no address provided, uses the configured wallet address
- Retrieves ETH balance from the blockchain
- Gets stETH and wstETH token balances
- Displays formatted balance information

**Information Displayed:**

- Account address
- ETH balance
- stETH balance
- wstETH balance

**Use Case:** Monitor account balances before performing vault operations or token transfers.

### steth-allowance-populate-tx (steth-allowance-tx)

Generates transaction data for setting stETH token allowance without executing the transaction.

**Arguments:**

- `<address>`: Address to set allowance for
- `<amount>`: Amount of stETH to allow

**Returns:** Raw transaction data that can be used for manual transaction submission

**Use Case:** Prepare allowance transactions for external signing or batch operations.

### get-steth-allowance

Retrieves the current stETH allowance granted to a specific address.

**Arguments:**

- `<address>`: Address to check allowance for

**Process:**

- Gets current account from configuration
- Queries stETH contract for allowance amount
- Returns formatted allowance value

### wsteth-allowance-populate-tx (wsteth-allowance-tx)

Generates transaction data for setting wstETH token allowance without executing the transaction.

**Arguments:**

- `<address>`: Address to set allowance for
- `<amount>`: Amount of wstETH to allow (in wstETH)

**Returns:** Raw transaction data for manual transaction handling

### get-wsteth-allowance

Retrieves the current wstETH allowance granted to a specific address.

**Arguments:**

- `<address>`: Address to check allowance for

**Process:**

- Uses current account from configuration
- Queries wstETH contract for allowance
- Displays allowance amount

### generate-key

Generates a new private key for creating an Ethereum account.

**Security Warning:** This command is not recommended for production use. Generated keys should be properly secured and never shared.

**Process:**

- Creates a cryptographically secure random private key
- Displays the private key for manual storage

**Use Case:** Development and testing environments only.

### generate-encrypted-account

Creates a new encrypted account file protected with a password.

**Arguments:**

- `<password>`: Password for encrypting the account

**Process:**

- Generates a new random private key
- Encrypts the account using the provided password
- Returns encrypted account data for secure storage

**Security Features:**

- Password-based encryption
- Secure random key generation
- JSON keystore format compatible with standard wallets

### steth-allowance

Sets allowance for stETH tokens, allowing a specific address to spend tokens on behalf of the account.

**Arguments:**

- `<address>`: Address to grant allowance to
- `<amount>`: Amount of stETH to allow (in stETH)

**Process:**

- Confirms the allowance operation with user
- Executes approve transaction on stETH contract
- Provides transaction receipt

**Requirements:**

- Valid wallet configuration with sufficient ETH for gas
- User confirmation of the allowance amount

**Use Case:** Enable Dashboard contracts to burn stETH tokens during vault operations.

### wsteth-allowance

Sets allowance for wstETH tokens, enabling delegation of token spending rights.

**Arguments:**

- `<address>`: Address to grant allowance to
- `<amount>`: Amount of wstETH to allow

**Process:**

- Requests user confirmation of allowance details
- Submits approve transaction to wstETH contract
- Returns transaction confirmation

**Requirements:**

- Configured wallet with gas funds
- User approval of transaction

## Token Allowances

Token allowances are essential for vault operations:

- **stETH Allowance**: Required for burning stETH tokens through Dashboard contracts
- **wstETH Allowance**: Needed for wstETH-related vault operations
- **Security**: Allowances should be set carefully and only for trusted contracts

## Security Considerations

- **Private Keys**: Never share or expose private keys
- **Allowances**: Only grant allowances to verified contract addresses
- **Testing**: Use testnet for development and testing
- **Encryption**: Always encrypt account files with strong passwords
- **Gas Fees**: Ensure sufficient ETH balance for transaction fees

## Error Handling

Common issues and solutions:

- **Missing Account**: Configure PRIVATE_KEY or provide account address
- **Insufficient Balance**: Ensure adequate ETH for gas fees
- **Invalid Address**: Verify contract and recipient addresses
- **Network Issues**: Check RPC endpoint configuration

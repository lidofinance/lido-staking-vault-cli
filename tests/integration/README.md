# Integration Tests

Integration tests for functions in the `features` folder, running on a forked blockchain using `@viem/anvil` and **Vitest**.

## Setup

Create a `.env.test` file in the project root with the following variables:

> **Note:** Integration tests look for environment variables in the `.env.test` file. If the file is not found, `.env` is used as a fallback.

```env
DEPLOYED=deployed-hoodi-vaults.json
CHAIN_ID=560048
EL_URL=
PRIVATE_KEY=0x...
VAULT_ADDRESS=0x...
FORK_BLOCK_NUMBER=18000000
ANVIL_PORT=8545
```

### Configuration Parameters

- `DEPLOYED` - filename in the `configs/` folder with contract addresses
- `CHAIN_ID` - network ID for the fork
- `EL_URL` - RPC node URL for forking
- `PRIVATE_KEY` - private key for executing transactions
- `VAULT_ADDRESS` - vault address for testing
- `FORK_BLOCK_NUMBER` - (optional) block number for forking
- `ANVIL_PORT` - (optional) port for Anvil (default: 8545)

## Running Tests

```bash
# Run all integration tests
yarn test:integration

# Run in watch mode
yarn test:integration:watch

# Run all tests (unit + integration)
yarn test

# Run with code coverage
yarn test:coverage
```

## Structure

- `globalSetup.ts` - starts Anvil fork before tests and stops after completion
- `helpers/` - testing utilities:
  - `test-config.ts` - configuration loading from env
  - `test-client.ts` - client creation and Anvil utilities
  - `test-assertions.ts` - helper functions for assertions and mocking
- `*.test.ts` - tests for various functions

## Test Framework

Tests use **Vitest** instead of Jest. Main differences:

- Imports from `vitest` instead of `@jest/globals`
- Mocks via `vi` instead of `jest`
- Faster execution and better ESM support

## Prompt Handling

Integration tests automatically skip all interactive prompts. When functions from `features` call `confirmOperation()`, in the test environment the prompt is automatically skipped without blocking execution.

This works through environment variables:

- `NODE_ENV=test`
- `VITEST=true`

## Anvil Utilities

Available utilities for testing write operations and manipulating time/blocks:

### Creating a Test Client

```typescript
import { createAnvilTestClient } from './helpers/test-client.js';
import { mainnet } from 'viem/chains';

const testClient = createAnvilTestClient(mainnet, 'http://127.0.0.1:8545');
```

### Account Impersonation

```typescript
import { impersonateAccount } from './helpers/test-client.js';
import { parseEther } from 'viem';

// Impersonate with 100 ETH balance by default
await impersonateAccount(testClient, address);

// Impersonate with custom balance
await impersonateAccount(testClient, address, parseEther('1000'));
```

### Setting ETH Balance

```typescript
import { mintEth } from './helpers/test-client.js';
import { parseEther } from 'viem';

// Set balance for an address
await mintEth(testClient, address, parseEther('1000'));
```

### Time Manipulation

```typescript
import {
  increaseTime,
  setTime,
  getCurrentTimestamp,
} from './helpers/test-client.js';

// Get current timestamp
const currentTime = await getCurrentTimestamp(testClient);

// Increase time by 1 hour (3600 seconds)
await increaseTime(testClient, 3600);

// Set specific time
await setTime(testClient, BigInt(Date.now() / 1000));
```

### Block Manipulation

```typescript
import { mineBlocks } from './helpers/test-client.js';

// Mine 1 block
await mineBlocks(testClient);

// Mine 5 blocks
await mineBlocks(testClient, 5);
```

### Creating Account from Private Key

```typescript
import { getAccountFromPrivateKey } from './helpers/test-client.js';

const account = getAccountFromPrivateKey('0x...');
// Used for creating wallet clients
```

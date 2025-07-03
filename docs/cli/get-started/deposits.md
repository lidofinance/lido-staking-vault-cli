---
sidebar_position: 6
---

# Validator Deposits

This guide covers validator deposit operations in Lido Staking Vaults, including predeposits, validator proving, and full deposits to the Beacon Chain.

## Overview

The deposit process involves several stages:

1. **Predeposit**: Initial validator registration with 1 ETH from vault
2. **Validator Proving**: Cryptographic proof that validator exists on Beacon Chain
3. **Full Deposit**: Complete 32 ETH deposit to activate validator
4. **Balance Management**: Node operator balance top-ups and withdrawals

All deposit operations work through the PredepositGuarantee (PDG) contract which manages validator lifecycle and node operator balances.

## Read Operations

### Get PDG Information

View basic information about the PredepositGuarantee contract:

```bash
yarn start deposits r info
```

### Check PDG Roles

View role assignments for the PredepositGuarantee contract:

```bash
yarn start deposits r roles
```

### Check Validator Status

Get the current status of a specific validator:

```bash
yarn start deposits r validator-status <validatorPubkey>
```

**Arguments:**

| Argument            | Description                   | Format                     |
| ------------------- | ----------------------------- | -------------------------- |
| `<validatorPubkey>` | Validator public key to check | 0x... (48-byte hex string) |

## Write Operations

### Predeposit Validators

Register validators with 1 ETH predeposits from the vault and lock node operator balance:

```bash
yarn start deposits w predeposit '<deposits_json>'
```

**Arguments and Options:**

| Argument/Option        | Description                   | Format                 |
| ---------------------- | ----------------------------- | ---------------------- |
| `<deposits>`           | Array of deposit data         | JSON array (see below) |
| `--no-bls-check`       | Skip BLS signature validation | Flag                   |
| `-v, --vault <string>` | Vault address                 | 0x...                  |

**Deposit Format:**

```json
[
  {
    "pubkey": "0x123...",
    "signature": "0xabc...",
    "amount": "1000000000",
    "deposit_data_root": "0xdef..."
  }
]
```

**Example:**

```bash
# Predeposit with BLS validation (recommended)
yarn start deposits w predeposit '[{
  "pubkey": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  "signature": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
  "amount": "1000000000",
  "deposit_data_root": "0xfedcbafedcbafedcbafedcbafedcbafedcbafedcbafedcbafedcbafedcbafedcba"
}]' -v 0x1234567890123456789012345678901234567890

# Skip BLS validation (faster but less secure)
yarn start deposits w predeposit '<deposits_json>' --no-bls-check
```

### Validator Proving

#### Create Proof and Prove

Generate cryptographic proof that a validator exists on the Beacon Chain:

```bash
yarn start deposits w proof-and-prove
```

**Options:**

| Option                | Description              | Format |
| --------------------- | ------------------------ | ------ |
| `-i, --index <index>` | Validator index to prove | Number |

**Example:**

```bash
# Interactive proof creation
yarn start deposits w proof-and-prove

# Prove specific validator index
yarn start deposits w proof-and-prove -i 12345
```

#### Prove and Deposit (Shortcut)

Node operator shortcut command that proves validators, tops up balance if needed, and deposits:

```bash
yarn start deposits w prove-and-deposit '<indexes>' '<deposits_json>'
```

**Arguments and Options:**

| Argument/Option        | Description                | Format                 |
| ---------------------- | -------------------------- | ---------------------- |
| `<indexes>`            | Array of validator indexes | JSON array of numbers  |
| `<deposits>`           | Array of deposit data      | JSON array (see above) |
| `-v, --vault <string>` | Vault address              | 0x...                  |

**Example:**

```bash
yarn start deposits w prove-and-deposit '[12345, 12346, 12347]' '[{
  "pubkey": "0x1234...",
  "signature": "0xabcd...",
  "amount": "32000000000",
  "deposit_data_root": "0xfed..."
}]' -v 0x1234567890123456789012345678901234567890
```

### Full Beacon Chain Deposit

Deposit the remaining 31 ETH to complete validator activation (total 32 ETH):

```bash
yarn start deposits w deposit-to-beacon-chain '<deposits_json>'
```

**Arguments and Options:**

| Argument/Option        | Description           | Format                 |
| ---------------------- | --------------------- | ---------------------- |
| `<deposits>`           | Array of deposit data | JSON array (see above) |
| `-v, --vault <string>` | Vault address         | 0x...                  |

**Example:**

```bash
yarn start deposits w deposit-to-beacon-chain '[{
  "pubkey": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  "signature": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
  "amount": "31000000000",
  "deposit_data_root": "0xfedcbafedcbafedcbafedcbafedcbafedcbafedcbafedcbafedcbafedcbafedcba"
}]' -v 0x1234567890123456789012345678901234567890
```

## Node Operator Balance Management

### Top Up Balance

Add ETH to node operator balance for covering predeposit requirements:

```bash
yarn start deposits w top-up <amount>
```

**Arguments and Options:**

| Argument/Option        | Description             | Format            |
| ---------------------- | ----------------------- | ----------------- |
| `<amount>`             | Amount in ETH to top up | Decimal (e.g., 1) |
| `-v, --vault <string>` | Vault address           | 0x...             |

**Example:**

```bash
# Top up with 2 ETH (enough for 2 predeposits)
yarn start deposits w top-up 2 -v 0x1234567890123456789012345678901234567890

# Interactive vault selection
yarn start deposits w top-up 1
```

### Withdraw Node Operator Balance

Withdraw ETH from node operator balance:

```bash
yarn start deposits w withdraw-no-balance <amount>
```

**Arguments and Options:**

| Argument/Option            | Description                      | Format              |
| -------------------------- | -------------------------------- | ------------------- |
| `<amount>`                 | Amount in ETH to withdraw        | Decimal (e.g., 5.0) |
| `-v, --vault <string>`     | Vault address                    | 0x...               |
| `-r, --recipient <string>` | Recipient address for withdrawal | 0x...               |

**Example:**

```bash
# Withdraw with specified recipient
yarn start deposits w withdraw-no-balance 5 \
  -v 0x1234567890123456789012345678901234567890 \
  -r 0x9876543210987654321098765432109876543210

# Interactive selection
yarn start deposits w withdraw-no-balance 5
```

### Set Node Operator Guarantor

Set or update the guarantor for the node operator:

```bash
yarn start deposits w set-no-guarantor
```

This command is interactive and will prompt for the new guarantor address.

## Deposit Workflow

### Complete Validator Setup Process

Here's the typical workflow for setting up new validators:

#### 1. Prepare Deposit Data

Generate deposit data using official Ethereum tools or validator clients:

:::tip **For Hoodi testnet only**
You can use this tool for generating deposit data: [Depositor](https://github.com/tamtamchik/depositor)
:::

#### 2. Top Up Node Operator Balance

Ensure sufficient balance for predeposits:

```bash
yarn start deposits w top-up 1
```

#### 3. Make Predeposit

Register validators with 1 ETH:

```bash
yarn start deposits w predeposit '[{
  "pubkey": "0x...",
  "signature": "0x...",
  "amount": "1000000000",
  "deposit_data_root": "0x..."
}]'
```

#### 4. Wait and Monitor

Wait for validator to appear on Beacon Chain, then check status:

```bash
yarn start pdg-helpers validator-info 0x...
```

#### 5. Check Validator status in PDG contract

```bash
yarn start deposits r validator-status 0x...
```

#### 6. Prove Validator

Create proof once validator is visible:

```bash
yarn start deposits w proof-and-prove -i <validator_index>
```

#### 7. Complete Deposit

Deposit remaining 31 ETH to activate validator:

```bash
yarn start deposits w deposit-to-beacon-chain '[{
  "pubkey": "0x...",
  "signature": "0x...",
  "amount": "31000000000",
  "deposit_data_root": "0x..."
}]'
```

## Security Considerations

### BLS Signature Validation

- **Always validate signatures** unless specifically testing
- BLS validation prevents invalid deposits
- Use `--no-bls-check` only for development/testing

### Deposit Data Verification

- **Double-check all deposit data** before submission
- **Verify public keys** match your validator setup
- **Confirm withdrawal credentials** point to vault

### Balance Management

- **Monitor node operator balance** before predeposits
- **Top up proactively** to avoid failed operations
- **Track validator lifecycle** to manage balance efficiently

## Error Handling

### Common Issues

**Insufficient Node Operator Balance**

```bash
# Check current balance and top up
yarn start deposits r info
yarn start deposits w top-up <amount>
```

**Invalid BLS Signature**

```bash
# Regenerate deposit data with correct withdrawal credentials
# Verify signature before retrying
```

**Permission Denied**

```bash
# Verify node operator role
yarn start vo r roles
```

## Monitoring and Troubleshooting

### Check Operation Status

Monitor your deposits and validator status:

```bash
# Check specific validator
yarn start deposits r validator-status <pubkey>

# Check validator on CL
yarn start pdg-helpers validator-info 0x...
```

## Related Operations

- **Vault Creation**: [Creating a Vault](./create-vault.md)
- **Funding Vaults**: [Supply and Withdrawal](./supply-withdrawal.md)
- **Reports**: [Reports](./reports.md)
- **Additional Helpers**: [Additional Helpers](./additional-helpers.md)

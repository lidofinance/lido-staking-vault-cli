---
sidebar_position: 6
---

# Validator Deposits

This guide covers validator deposit operations in Lido Staking Vaults, including predeposits, validator proving and activation, and balance management.

## Overview

The deposit process involves several stages:

1. **Top Up Node Operator Balance**: Add ETH to node operator balance for covering predeposit requirements
2. **Predeposit**: Initial validator registration with 1 ETH from vault
3. **Validator Proving and Activation**: Cryptographic proof that validator exists on Beacon Chain and activation deposit of 31 ETH from staged balance of vault
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

### Check Node Operator Balance

Get total, locked, and unlocked balances for the Node Operator in PDG:

```bash
yarn start deposits r no-balance
```

**Aliases:** `no-bal`

**Example:**

```bash
# Check node operator balance
yarn start deposits r no-balance

# Using alias
yarn start deposits r no-bal
```

This command shows:

- **Total**: Total ETH balance for the node operator
- **Locked**: ETH locked for predeposits
- **Unlocked**: Available ETH that can be locked for predeposit or withdrawn

### Check Node Operator Info

Get comprehensive information about the Node Operator in PDG:

```bash
yarn start deposits r no-info
```

**Example:**

```bash
# Get full node operator information
yarn start deposits r no-info
```

This command displays:

- Balance information (total, locked, unlocked)
- Depositor address (with indication if it's your address)
- Guarantor address (with indication if it's your address)
- Claimable Refund amount (if the guarantor is not you)

### Check Pending Activations

Get the number of validators in PREDEPOSITED and PROVEN states but not ACTIVATED yet:

```bash
yarn start deposits r pending-activations
```

**Options:**

| Option                 | Description   | Format |
| ---------------------- | ------------- | ------ |
| `-v, --vault <string>` | Vault address | 0x...  |

**Example:**

```bash
yarn start deposits r pending-activations -v 0x1234567890123456789012345678901234567890
```

This command shows:

- Pending Activations of validators

## Write Operations

### Top Up Node Operator Balance

Add ETH to node operator balance for covering predeposit requirements:

```bash
yarn start deposits w top-up-no <amount>
```

**Arguments and Options:**

| Argument/Option        | Description             | Format            |
| ---------------------- | ----------------------- | ----------------- |
| `<amount>`             | Amount in ETH to top up | Decimal (e.g., 1) |
| `-v, --vault <string>` | Vault address           | 0x...             |

**Example:**

```bash
yarn start deposits w top-up-no 1 -v 0x1234567890123456789012345678901234567890

# Interactive vault selection
yarn start deposits w top-up-no 1
```

### Predeposit Validators

Deposits NO's validators with PREDEPOSIT_AMOUNT ether from StakingVault and locks up NO's balance

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

#### Create Proof and Prove, Activate

Permissionless method to prove correct Withdrawal Credentials for the validator and to send the ACTIVATION_DEPOSIT_AMOUNT (31 ETH) from the staged balance of StakingVault:

```bash
yarn start deposits w prove-and-activate
```

**Options:**

| Option                | Description              | Format |
| --------------------- | ------------------------ | ------ |
| `-i, --index <index>` | Validator index to prove | Number |

**Example:**

```bash
# Interactive proof creation
yarn start deposits w prove-and-activate

# Prove specific validator index
yarn start deposits w prove-and-activate -i 12345
```

#### Prove and Top Up (Shortcut)

happy path shortcut for the node operator (or depositor) that allows:

- to prove validator's WC to unlock NO balance
- to activate the validator depositing ACTIVATION_DEPOSIT_AMOUNT (31 ETH) from StakingVault staged balance
- to top up validator on top of ACTIVATION_DEPOSIT_AMOUNT (31 ETH)

And do it for multiple validators at once by providing an array of validator indexes and amounts

```bash
yarn start deposits w prove-and-top-up '<indexes>' '<amounts>'
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

### Top Up Existing Validators

Deposits ether to proven validators from StakingVault.

```bash
yarn start deposits w top-up-existing-validators '<topUps>'
```

**Arguments and Options:**

| Argument/Option        | Description                                             | Format                 |
| ---------------------- | ------------------------------------------------------- | ---------------------- |
| `<topUps>`             | Array of ValidatorTopUp structs with pubkey and amounts | JSON array (see above) |
| `-v, --vault <string>` | Vault address                                           | 0x...                  |

**Example:**

```bash
yarn start deposits w top-up-existing-validators '[{
  "pubkey": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  "amount": "31000000000",
}]' -v 0x1234567890123456789012345678901234567890
```

## Node Operator Balance Management

### Top Up Node Operator Balance

Add ETH to node operator balance for covering predeposit requirements:

```bash
yarn start deposits w top-up-no <amount>
```

**Arguments and Options:**

| Argument/Option        | Description             | Format            |
| ---------------------- | ----------------------- | ----------------- |
| `<amount>`             | Amount in ETH to top up | Decimal (e.g., 1) |
| `-v, --vault <string>` | Vault address           | 0x...             |

**Example:**

```bash
# Top up with 2 ETH (enough for 2 predeposits)
yarn start deposits w top-up-no 2 -v 0x1234567890123456789012345678901234567890

# Interactive vault selection
yarn start deposits w top-up-no 1
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
yarn start deposits w top-up-no 1
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

#### 6. Prove and Activate Validator

Create proof and activate validator once validator is visible:

```bash
yarn start deposits w prove-and-activate -i <validator_index>
```

#### 7. Top UP Existing Validators

Deposit ether to proven validators from StakingVault.

```bash
yarn start deposits w top-up-existing-validators '<topUps>'
```

**Arguments and Options:**

| Argument/Option        | Description                                             | Format                 |
| ---------------------- | ------------------------------------------------------- | ---------------------- |
| `<topUps>`             | Array of ValidatorTopUp structs with pubkey and amounts | JSON array (see above) |
| `-v, --vault <string>` | Vault address                                           | 0x...                  |

**Example:**

```bash
yarn start deposits w top-up-existing-validators '[{
  "pubkey": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  "amount": "31000000000",
}]' -v 0x1234567890123456789012345678901234567890
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
yarn start deposits w top-up-no <amount>
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

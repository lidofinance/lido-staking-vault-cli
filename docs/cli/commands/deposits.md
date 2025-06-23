---
sidebar_position: 3
---

# Deposits

## Command

```bash
yarn start deposits [arguments] [-options]
```

## Deposits commands list

```bash
yarn start deposits -h
```

## Overview

Deposits commands handle validator deposits for Lido Staking Vaults. They work with the Predeposit Guarantee (PDG) system to manage node operator deposits, proofs, and balance management.

## API

| Command   | Description    |
| --------- | -------------- |
| read (r)  | read commands  |
| write (w) | write commands |

### Read

Currently no read commands are implemented for deposits.

### Write

| Command                                  | Description                                                                                                  |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| predeposit \<deposits>                   | Deposits node operator's validators with PREDEPOSIT_AMOUNT ether from StakingVault and locks up NO's balance |
| proof-and-prove (prove)                  | Create proof for a validator and prove its withdrawal credentials                                            |
| prove-and-deposit \<indexes> \<deposits> | Shortcut for the node operator: prove, top up and deposit to proven validators                               |
| deposit-to-beacon-chain \<deposits>      | Deposits ether to proven validators from staking vault to the Ethereum Beacon Chain                          |
| top-up \<amount>                         | Top up node operator balance in the PDG contract                                                             |
| withdraw-no-balance \<amount>            | Withdraw node operator balance from the PDG contract                                                         |
| set-no-guarantor (set-no-g)              | Set node operator guarantor address                                                                          |

## Command Details

### predeposit

Initiates the predeposit process for validators within a StakingVault. This command is the first step in the two-phase deposit process designed to prevent frontrunning attacks.

**Process:**

- Validates BLS signatures for each deposit (unless `--no-bls-check` is used)
- Verifies the calling account is the node operator for the specified vault
- Automatically tops up node operator balance in PDG if insufficient funds
- Locks the PREDEPOSIT_AMOUNT (1 ETH) for each validator in the PDG contract
- Prepares validators for the final 31 ETH deposit to reach the full 32 ETH stake

**Options:**

- `--no-bls-check`: Skip BLS signature validation (not recommended for production)
- `-v, --vault <address>`: Specify StakingVault address

**Deposit Format:**

```json
[
  {
    "pubkey": "validator_public_key",
    "signature": "bls_signature",
    "amount": "deposit_amount_in_wei",
    "deposit_data_root": "merkle_root"
  }
]
```

**Security:** This command includes comprehensive validation of deposit data, withdrawal credentials, and BLS signatures to ensure compatibility with the vault's configuration.

### proof-and-prove (prove)

Creates and submits a cryptographic proof that a validator with the given index has the correct withdrawal credentials pointing to the StakingVault. This proof is essential for the security model of stVaults.

**Process:**

- Generates a Merkle proof from the Beacon Chain state
- Validates withdrawal credentials match the vault address
- Submits proof to the PredepositGuarantee contract
- Enables the validator for full deposits

**Options:**

- `-i, --index <number>`: Validator index on the Beacon Chain

**Technical Details:** Uses Beacon Chain state proofs to cryptographically verify that a validator's withdrawal credentials are properly set to the StakingVault contract address.

### prove-and-deposit

A convenience command that combines the proving process with the final deposit in a single transaction. This is particularly useful for node operators managing multiple validators.

**Arguments:**

- `<indexes>`: Array of validator indexes to prove on the Beacon Chain
- `<deposits>`: Array of deposit data corresponding to the validators

**Process:**

1. Generates proofs for all specified validator indexes
2. Validates withdrawal credentials for each validator
3. Performs the final 31 ETH deposit to complete the 32 ETH stake
4. All operations are batched into a single transaction

### deposit-to-beacon-chain

Completes the validator deposit process by sending the remaining 31 ETH to proven validators, bringing them to the full 32 ETH required for activation on the Beacon Chain.

**Requirements:**

- Validators must be successfully proven first via `proof-and-prove`
- Caller must be the node operator of the StakingVault
- Sufficient ETH balance must be available in the vault
- Vault must be properly connected to VaultHub

**Process:** Transfers the final portion of the stake from the StakingVault to the Ethereum Deposit Contract, completing the validator activation process.

### top-up

Adds ETH to the node operator's balance in the PredepositGuarantee contract. This is required when the node operator doesn't have sufficient unlocked balance for predeposits.

**Arguments:**

- `<amount>`: Amount in ETH to add to the balance

**Options:**

- `-v, --vault <address>`: Specify StakingVault address

**Access Control:** Can be called by either the node operator or their designated guarantor.

### withdraw-no-balance

Withdraws ETH from the node operator's balance in the PredepositGuarantee contract to a specified recipient address.

**Arguments:**

- `<amount>`: Amount in ETH to withdraw

**Options:**

- `-v, --vault <address>`: Specify StakingVault address
- `-r, --recipient <address>`: Address to receive the withdrawn funds

**Constraints:**

- Only unlocked balance can be withdrawn
- Must maintain sufficient balance for any pending validator obligations

### set-no-guarantor

Changes the guarantor address for a node operator and provides refund to the previous guarantor if the node operator has balance.

**Process:**

- Changes guarantor for the calling node operator
- If node operator has total balance, refunds it to the previous guarantor
- Previous guarantor can claim the refund using `claimGuarantorRefund()`
- Sets the new guarantor for the node operator

**Requirements:**

- Node operator must not have locked balance (reverts if locked balance > 0)
- New guarantor cannot be zero address
- New guarantor must be different from current guarantor

**Use Case:** Allows node operators to change their guarantor while ensuring previous guarantor gets refunded for any existing balance.

## Withdrawal Credentials

All validators created through these commands use **0x02-type withdrawal credentials** pointing directly to the StakingVault contract. This ensures:

- Non-custodial operation - node operators never hold ETH
- Automatic reward collection to the vault
- Support for [EIP-7251](https://eips.ethereum.org/EIPS/eip-7251) validator consolidation
- Compatibility with [EIP-7002](https://eips.ethereum.org/EIPS/eip-7002) triggered withdrawals

## Security Features

- **Frontrunning Protection**: Two-phase deposit process via PredepositGuarantee
- **BLS Validation**: Comprehensive cryptographic validation of all deposit data
- **Balance Verification**: Automatic checking of sufficient unlocked balance
- **Role Authorization**: Strict verification of caller permissions
- **Withdrawal Credentials Validation**: Ensures validators point to correct vault
- **Confirmation Prompts**: User confirmation for all important operations

## Error Handling

The system includes comprehensive error checking for:

- Invalid BLS signatures or deposit data format
- Insufficient unlocked balance in PredepositGuarantee
- Unauthorized access attempts (wrong node operator/guarantor)
- Invalid withdrawal credentials (not pointing to vault)
- Missing or incorrect validator proofs from Beacon Chain
- Vault health check failures

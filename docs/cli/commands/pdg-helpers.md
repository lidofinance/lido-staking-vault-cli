---
sidebar_position: 6
---

# PredepositGuarantee Helpers

## Command

```bash
yarn start pdg-helpers [arguments] [-options]
```

## PDG helpers commands list

```bash
yarn start pdg-helpers -h
```

## Overview

PredepositGuarantee Helper commands provide utilities for working with Beacon Chain proofs, BLS signature validation, and cryptographic primitives required for the Predeposit Guarantee system.

## API

| Command                                                                                             | Description                                                         |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| proof-and-check proof-check                                                                         | make predeposit proof by validator index and check by test contract |
| proof                                                                                               | make predeposit proof by validator index                            |
| verify-predeposit-bls verify-bls\<deposits>                                                         | Verifies BLS signature of the deposit                               |
| fv-gindex \<forks>                                                                                  | get first validator gindex                                          |
| compute-deposit-data-root compute-dd-root\<pubkey> \<withdrawal-credentials> \<signature> \<amount> | compute deposit data root                                           |
| compute-deposit-domain compute-d-domain\<forkVersion>                                               | compute deposit domain                                              |

## Command Details

### proof-and-check (proof-check)

Creates a Merkle proof for a validator and validates it against the PredepositGuarantee contract's verification function.

**Options:**

- `-i, --index <number>`: Validator index on the Beacon Chain

**Process:**

- Prompts for confirmation of validator index
- Generates Merkle proof from Beacon Chain state
- Validates proof using PDG contract's `validatePubKeyWCProof` function
- Displays proof verification results and detailed proof data

**Output:**

- Proof verification status
- Complete Merkle proof array
- Validator public key
- Child block timestamp
- Withdrawal credentials

**Use Case:** Test and validate proofs before submitting them in production transactions.

### proof

Generates a Merkle proof for a validator index without executing any on-chain validation.

**Options:**

- `-i, --index <number>`: Validator index on the Beacon Chain

**Process:**

- Confirms validator index with user
- Creates cryptographic proof from Beacon Chain state
- Extracts and displays proof components

**Output:**

- Raw Merkle proof data
- Validator metadata (pubkey, timestamp, withdrawal credentials)
- Slot and proposer index information

**Use Case:** Generate proofs for later use in batch operations or external verification.

### verify-predeposit-bls (verify-bls)

Performs comprehensive BLS signature validation for deposit data, including both off-chain and on-chain verification.

**Arguments:**

- `<deposits>`: Array of deposit data structures

**Options:**

- `-a, --vault <address>`: Vault address (to get withdrawal credentials)
- `-w, --withdrawalCredentials <hex>`: Explicit withdrawal credentials

**Validation Steps:**

1. **Amount Check**: Verifies deposit amount equals PREDEPOSIT_AMOUNT (1 ETH)
2. **Deposit Data Root**: Validates computed root matches provided root
3. **Off-chain BLS**: Verifies BLS signature using local cryptographic libraries
4. **On-chain BLS**: Validates signature against PredepositGuarantee contract

**Requirements:**

- Must provide either vault address OR withdrawal credentials (not both)
- Valid BLS signatures and deposit data format

**Security Features:**

- Dual validation (off-chain + on-chain)
- Comprehensive deposit data verification
- Withdrawal credentials validation

### fv-gindex

Calculates the first validator gindex for Beacon Chain state tree navigation.

**Arguments:**

- `<forks>`: Fork configuration parameters

**Process:**

- Computes gindex based on Beacon Chain fork specifications
- Accounts for validator set size and tree structure changes

**Use Case:** Internal utility for proof generation and Beacon Chain state navigation.

### compute-deposit-data-root (compute-dd-root)

Computes the deposit data root for given deposit parameters.

**Arguments:**

- `<pubkey>`: Validator public key
- `<withdrawal-credentials>`: 0x02-type withdrawal credentials
- `<signature>`: BLS signature
- `<amount>`: Deposit amount in ETH

**Process:**

- Creates deposit data structure
- Computes Merkle root using SSZ serialization
- Returns standardized deposit data root

**Output:**

- All input parameters
- Computed deposit data root

**Use Case:** Verify deposit data integrity and generate roots for deposit validation.

### compute-deposit-domain (compute-d-domain)

Computes the deposit domain for BLS signature verification based on fork version.

**Arguments:**

- `<forkVersion>`: Ethereum fork version

**Process:**

- Uses fork version to determine network parameters
- Computes domain separation for BLS signatures
- Returns formatted domain value

**Output:**

- Fork version used
- Computed deposit domain

**Use Case:** Generate domain values for BLS signature creation and verification.

## Deposit Data Format

All commands expecting deposit data use this JSON format:

```json
[
  {
    "pubkey": "validator_public_key_hex",
    "signature": "bls_signature_hex",
    "amount": "deposit_amount_in_wei",
    "deposit_data_root": "merkle_root_hex"
  }
]
```

## Cryptographic Validation

The helper commands implement multiple layers of validation:

### BLS Signature Verification

- **Off-chain**: Fast local verification using BLS libraries
- **On-chain**: Contract-based verification using BLS12-381 pairing
- **Domain Separation**: Proper fork-specific domain usage

### Merkle Proof Generation

- **Beacon Chain State**: Extracts validator data from consensus layer
- **SSZ Serialization**: Standard Ethereum serialization format
- **Tree Navigation**: Efficient gindex-based state tree traversal

### Deposit Data Integrity

- **Root Verification**: Ensures deposit data root matches computed value
- **Amount Validation**: Confirms correct predeposit amount (1 ETH)
- **Withdrawal Credentials**: Validates 0x02-type vault credentials

## Security Features

- **Comprehensive Validation**: Multiple independent verification methods
- **Cryptographic Proofs**: Uses Beacon Chain state proofs for security
- **Contract Integration**: Validates against actual deployed contracts
- **Error Detection**: Identifies invalid signatures, amounts, and credentials

## Use Cases

### Development & Testing

- Validate deposit data before submission
- Test proof generation and verification
- Debug BLS signature issues

### Production Operations

- Generate proofs for validator proving
- Verify deposit integrity before broadcasting
- Compute cryptographic primitives for deposits

### Debugging & Analysis

- Analyze failed deposit transactions
- Verify proof correctness
- Test cryptographic components

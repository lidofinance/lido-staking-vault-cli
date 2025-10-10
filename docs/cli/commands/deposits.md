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

|                                             | Command                                                                                                                  | Description |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------- |
| info                                        | get PredepositGuarantee base info                                                                                        |
| roles                                       | get PredepositGuarantee roles                                                                                            |
| validator-status v-status\<validatorPubkey> | get validator status                                                                                                     |
| no-balance no-bal                           | get total,locked & unlocked (the amount of ether that NO can lock for predeposit or withdraw) balances for the NO in PDG |
| no-info                                     | get info about the NO in PDG                                                                                             |
| pending-activations pd                      | get the amount of ether that is pending as predeposits but not proved yet                                                |

### Write

| Command                                        | Description                                                                                                        |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| predeposit \<deposits>                         | deposits NO's validators with PREDEPOSIT_AMOUNT ether from StakingVault and locks up NO's balance                  |
| proof-and-prove prove                          | permissionless method to prove correct Withdrawal Credentials for the validator and to send the activation deposit |
| prove-and-top-up \<indexes> \<amounts>         | prove validators to unlock NO balance, activate the validators from stash, and optionally top up NO balance        |
| top-up-existing-validators top-up-val\<topUps> | deposits ether to proven validators from staking vault                                                             |
| top-up-no \<amount>                            | top up Node Operator balance                                                                                       |
| withdraw-no-balance \<amount>                  | withdraw Node Operator balance                                                                                     |
| set-no-guarantor set-no-g                      | set Node Operator guarantor                                                                                        |

## Command Details

### info

Retrieves comprehensive technical information about the PredepositGuarantee (PDG) contract including all system parameters and configuration.

**Output:**

- **CONTRACT_ADDRESS**: Deployed PDG contract address
- **Role Identifiers**: DEFAULT_ADMIN_ROLE, RESUME_ROLE, PAUSE_ROLE
- **System Constants**: BEACON_ROOTS, PREDEPOSIT_AMOUNT, PIVOT_SLOT
- **Gindex Values**: GI_FIRST_VALIDATOR_CURR, GI_FIRST_VALIDATOR_PREV, GI_PUBKEY_WC_PARENT, GI_STATE_ROOT
- **Version Support**: MAX_SUPPORTED_WC_VERSION, MIN_SUPPORTED_WC_VERSION
- **State Information**: isPaused status and resumeSinceTimestamp

### roles

Displays detailed role assignments and access control configuration for the PredepositGuarantee contract with complete member listings.

**Output:**

- **Role Name**: Human-readable role identifier
- **Keccak Hash**: Role identifier used in contract calls
- **Members**: Comma-separated list of addresses holding the role (or "None" if empty)

### validator-status

Retrieves current status information for a specific validator registered in the PredepositGuarantee system.

**Arguments:**

- `<validatorPubkey>`: The BLS public key of the validator to check (hex format)

**Output:**

- **Validator Pubkey**: Hex-formatted validator public key
- **Status**: Current stage with mapping (NONE=0, PREDEPOSITED=1, PROVEN=2, DISPROVEN=3, COMPENSATED=4)
- **Staking Vault**: Associated StakingVault contract address
- **Node Operator**: Node operator address responsible for this validator

**Status Definitions:**

- NONE (0): Validator not registered in PDG
- PREDEPOSITED (1): 1 ETH predeposit completed, awaiting proof
- PROVEN (2): Withdrawal credentials proven, ready for full deposit
- DISPROVEN (3): Proof failed or invalid withdrawal credentials
- COMPENSATED (4): Node operator compensated for failed validator

### no-balance

Retrieves current balance breakdown for a node operator in the PredepositGuarantee contract showing total, locked, and unlocked ETH amounts.

**Output (Table Format):**

- **Total**: Complete ETH balance held by the node operator in PDG
- **Locked**: ETH currently locked for validator predeposits
- **Unlocked**: ETH available for new predeposits or withdrawal

**Balance Calculation:** Total = Locked + Unlocked.

### no-info

Provides comprehensive information about a node operator including balance details and role assignments with current account relationship indicators.

**Output (Table Format):**

- **Total**: Complete ETH balance
- **Locked**: ETH locked for predeposits
- **Unlocked**: ETH available for operations
- **Depositor**: Address authorized to make deposits, with "(you)" if current account matches
- **Guarantor**: Address providing balance management, with "(you)" if current account matches

### pending-activations (pd)

Retrieves the current amount of ether that is predeposited to a given vault.

**Options:**

- `-v, --vault <address>`: Specify vault address (interactive selection if not provided)

**Output:**

- **Pending Predeposits amount, ETH**: Amount of ETH currently predeposited to the vault

**Use Case:** Monitor how much ETH is currently in predeposit state for a specific vault, helping track pending validator activations.

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

### prove-and-top-up

Proves validators to unlock node operator balance, activates validators from stash, and optionally tops up Node Operator balance.

**Arguments:**

- `<indexes>`: Array of validator indexes to prove on the Beacon Chain
- `<amounts>`: Array of amounts to top up node operator balance (in wei)

**Options:**

- `-v, --vault <address>`: Specify vault address (interactive selection if not provided)

**Process:**

1. Validates caller is the node operator for the vault
2. Generates proofs for all specified validator indexes
3. Validates withdrawal credentials for each validator
4. Activates validators from stash state
5. Tops up node operator balance with specified amounts

**Requirements:**

- Caller must be the node operator of the vault
- Valid validator indexes that can be proven

### top-up-existing-validators (top-up-val)

Deposits ether to proven validators from staking vault.

**Arguments:**

- `<topUps>`: Array of ValidatorTopUp structs with pubkey and amounts

**Options:**

- `-v, --vault <address>`: Specify vault address (interactive selection if not provided)

**ValidatorTopUp Format:**

```json
[
  {
    "pubkey": "validator_public_key_hex",
    "amount": "amount_in_wei"
  }
]
```

**Process:**

1. Validates caller is the node operator for the vault
2. Confirms top-up operation with user
3. Transfers specified amounts to validators via PredepositGuarantee contract

**Requirements:**

- Caller must be the node operator of the StakingVault
- Validators must be in proven state
- Sufficient ETH balance must be available in the vault
- Valid validator public keys and amounts

### top-up-no

Adds ETH to the node operator's balance in the PredepositGuarantee contract. This is required when the node operator doesn't have sufficient unlocked balance for predeposits.

**Arguments:**

- `<amount>`: Amount in ETH to add to the balance

**Options:**

- `-v, --vault <address>`: Specify StakingVault address (interactive selection if not provided)

**Process:**

1. Determines the node operator for the specified vault
2. Validates caller permissions (node operator or guarantor)
3. Confirms the top-up operation
4. Transfers ETH to increase node operator balance in PDG

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

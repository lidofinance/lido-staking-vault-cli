---
sidebar_position: 7
---

# PredepositGuarantee

## Command

```bash
lsv-cli pdg [arguments] [-options]
```

## Delegation commands list

```bash
lsv-cli pdg -h
```

## API

| Command                                      | Description                                                                     |
| -------------------------------------------- | ------------------------------------------------------------------------------- |
| BEACON_ROOTS                                 | Calls the read-only function "BEACON_ROOTS" on the contract.                    |
| DEFAULT_ADMIN_ROLE                           | Calls the read-only function "DEFAULT_ADMIN_ROLE" on the contract.              |
| GI_FIRST_VALIDATOR                           | Calls the read-only function "GI_FIRST_VALIDATOR" on the contract.              |
| GI_FIRST_VALIDATOR_AFTER_CHANGE              | Calls the read-only function "GI_FIRST_VALIDATOR_AFTER_CHANGE" on the contract. |
| GI_PUBKEY_WC_PARENT                          | Calls the read-only function "GI_PUBKEY_WC_PARENT" on the contract.             |
| GI_STATE_ROOT                                | Calls the read-only function "GI_STATE_ROOT" on the contract.                   |
| MAX_SUPPORTED_WC_VERSION                     | Calls the read-only function "MAX_SUPPORTED_WC_VERSION" on the contract.        |
| MIN_SUPPORTED_WC_VERSION                     | Calls the read-only function "MIN_SUPPORTED_WC_VERSION" on the contract.        |
| PAUSE_INFINITELY                             | Calls the read-only function "PAUSE_INFINITELY" on the contract.                |
| PAUSE_ROLE                                   | Calls the read-only function "PAUSE_ROLE" on the contract.                      |
| PREDEPOSIT_AMOUNT                            | Calls the read-only function "PREDEPOSIT_AMOUNT" on the contract.               |
| RESUME_ROLE                                  | Calls the read-only function "RESUME_ROLE" on the contract.                     |
| SLOT_CHANGE_GI_FIRST_VALIDATOR               | Calls the read-only function "SLOT_CHANGE_GI_FIRST_VALIDATOR" on the contract.  |
| STATE_ROOT_DEPTH                             | Calls the read-only function "STATE_ROOT_DEPTH" on the contract.                |
| STATE_ROOT_POSITION                          | Calls the read-only function "STATE_ROOT_POSITION" on the contract.             |
| WC_PUBKEY_PARENT_DEPTH                       | Calls the read-only function "WC_PUBKEY_PARENT_DEPTH" on the contract.          |
| WC_PUBKEY_PARENT_POSITION                    | Calls the read-only function "WC_PUBKEY_PARENT_POSITION" on the contract.       |
| claimableRefund \<\_guarantor>               | Calls the read-only function "claimableRefund" on the contract.                 |
| getResumeSinceTimestamp                      | Calls the read-only function "getResumeSinceTimestamp" on the contract.         |
| getRoleAdmin \<role>                         | Calls the read-only function "getRoleAdmin" on the contract.                    |
| getRoleMember \<role> \<index>               | Calls the read-only function "getRoleMember" on the contract.                   |
| getRoleMemberCount \<role>                   | Calls the read-only function "getRoleMemberCount" on the contract.              |
| getRoleMembers \<role>                       | Calls the read-only function "getRoleMembers" on the contract.                  |
| hasRole \<role> \<account>                   | Calls the read-only function "hasRole" on the contract.                         |
| isPaused                                     | Calls the read-only function "isPaused" on the contract.                        |
| nodeOperatorBalance \<\_nodeOperator>        | Calls the read-only function "nodeOperatorBalance" on the contract.             |
| nodeOperatorGuarantor \<\_nodeOperator>      | Calls the read-only function "nodeOperatorGuarantor" on the contract.           |
| supportsInterface \<interfaceId>             | Calls the read-only function "supportsInterface" on the contract.               |
| unlockedBalance \<\_nodeOperator>            | Calls the read-only function "unlockedBalance" on the contract.                 |
| validatorStatus \<\_validatorPubkey>         | Calls the read-only function "validatorStatus" on the contract.                 |
| predeposit \<vault> \<deposits>              | predeposit                                                                      |
| create-proof-and-prove \<index>              | create proof and prove                                                          |
| deposit-to-beacon-chain \<vault> \<deposits> | deposit to beacon chain                                                         |

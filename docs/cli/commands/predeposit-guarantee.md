---
sidebar_position: 7
---

# PredepositGuarantee

## Command

```bash
lsv-cli pdg [arguments] [-options]
```

## PredepositGuarantee commands list

```bash
lsv-cli pdg -h
```

## API

| Command                                                             | Description                                                               |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| beacon-roots                                                        | get beacon roots address                                                  |
| d-admin-r                                                           | get default admin role                                                    |
| fv-gi                                                               | get first validator gIndex                                                |
| fv-gi-ac                                                            | get first validator gIndex after change                                   |
| pw-gi                                                               | get pubkey wc parent gIndex                                               |
| sr-gi                                                               | get state root gIndex                                                     |
| max-wc                                                              | get max supported wc version                                              |
| min-wc                                                              | get min supported wc version                                              |
| PAUSE_INFINITELY                                                    | Calls the read-only function "PAUSE_INFINITELY" on the contract.          |
| PAUSE_ROLE                                                          | Calls the read-only function "PAUSE_ROLE" on the contract.                |
| PREDEPOSIT_AMOUNT                                                   | Calls the read-only function "PREDEPOSIT_AMOUNT" on the contract.         |
| RESUME_ROLE                                                         | Calls the read-only function "RESUME_ROLE" on the contract.               |
| fv-gi-sc                                                            | get slot change first validator gIndex                                    |
| STATE_ROOT_DEPTH                                                    | Calls the read-only function "STATE_ROOT_DEPTH" on the contract.          |
| STATE_ROOT_POSITION                                                 | Calls the read-only function "STATE_ROOT_POSITION" on the contract.       |
| WC_PUBKEY_PARENT_DEPTH                                              | Calls the read-only function "WC_PUBKEY_PARENT_DEPTH" on the contract.    |
| WC_PUBKEY_PARENT_POSITION                                           | Calls the read-only function "WC_PUBKEY_PARENT_POSITION" on the contract. |
| claimable-r \<guarantor>                                            | get claimable refund                                                      |
| resume-since-ts                                                     | get resume since timestamp                                                |
| getRoleAdmin \<role>                                                | Calls the read-only function "getRoleAdmin" on the contract.              |
| getRoleMember \<role> \<index>                                      | Calls the read-only function "getRoleMember" on the contract.             |
| getRoleMemberCount \<role>                                          | Calls the read-only function "getRoleMemberCount" on the contract.        |
| getRoleMembers \<role>                                              | Calls the read-only function "getRoleMembers" on the contract.            |
| hasRole \<role> \<account>                                          | Calls the read-only function "hasRole" on the contract.                   |
| is-paused                                                           | get is paused boolean                                                     |
| no-bal \<address>                                                   | get node operator balance by address                                      |
| no-g \<address>                                                     | get node operator guarantor                                               |
| supportsInterface \<interfaceId>                                    | Calls the read-only function "supportsInterface" on the contract.         |
| ub-bal \<address>                                                   | get unlocked balance                                                      |
| v-status \<pubkey>                                                  | get validator status                                                      |
| predeposit \<vault> \<deposits>                                     | predeposit                                                                |
| verify-predeposit-bls (verify-bls)\<deposits>                       | Verifies BLS signature of the deposit                                     |
| proof-and-prove prove\<index>                                       | make proof and prove                                                      |
| prove-and-deposit \<indexes> \<vault> \<deposits>                   | prove and deposit                                                         |
| deposit-to-beacon-chain \<vault> \<deposits>                        | deposit to beacon chain                                                   |
| top-up \<nodeOperator> \<amount>                                    | top up no balance                                                         |
| prove-unknown-validator \<index> \<vault>                           | prove unknown validator                                                   |
| prove-invalid-validator-wc \<index> \<invalidWithdrawalCredentials> | prove invalid validator withdrawal credentials                            |
| withdraw-no-balance \<nodeOperator> \<amount> \<recipient>          | withdraw node operator balance                                            |
| set-no-guarantor (set-no-g)\<guarantor>                             | set node operator guarantor                                               |
| claim-guarantor-refund (claim-g-refund)\<recipient>                 | claim guarantor refund                                                    |
| compensate-disproven-predeposit (compensate)\<pubkey> \<recipient>  | compensate disproven predeposit                                           |

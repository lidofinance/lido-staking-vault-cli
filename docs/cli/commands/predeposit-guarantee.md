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

| Command   | Description    |
| --------- | -------------- |
| read (r)  | read commands  |
| write (w) | write commands |

### Read

| Command                          | Description                                                        |
| -------------------------------- | ------------------------------------------------------------------ |
| info                             |                                                                    |
| roles                            |                                                                    |
| BEACON_ROOTS                     | get beacon roots address                                           |
| DEFAULT_ADMIN_ROLE               | get default admin role                                             |
| GI_FIRST_VALIDATOR               | get first validator gIndex                                         |
| GI_FIRST_VALIDATOR_AFTER_CHANGE  | get first validator gIndex after change                            |
| GI_PUBKEY_WC_PARENT              | get pubkey wc parent gIndex                                        |
| GI_STATE_ROOT                    | get state root gIndex                                              |
| MAX_SUPPORTED_WC_VERSION         | get max supported wc version                                       |
| MIN_SUPPORTED_WC_VERSION         | get min supported wc version                                       |
| PAUSE_INFINITELY                 | get special value for the infinite pause                           |
| PAUSE_ROLE                       | get pause role                                                     |
| PREDEPOSIT_AMOUNT                | get amount of ether that is predeposited with each validator       |
| RESUME_ROLE                      | get resume role                                                    |
| SLOT_CHANGE_GI_FIRST_VALIDATOR   | get slot change first validator gIndex                             |
| STATE_ROOT_DEPTH                 | get state root depth                                               |
| STATE_ROOT_POSITION              | get state root position                                            |
| WC_PUBKEY_PARENT_DEPTH           | get wc pubkey parent depth                                         |
| WC_PUBKEY_PARENT_POSITION        | get wc pubkey parent position                                      |
| claimable-r \<guarantor>         | get claimable refund                                               |
| resume-since-ts                  | get resume since timestamp                                         |
| getRoleAdmin \<role>             | Calls the read-only function "getRoleAdmin" on the contract.       |
| getRoleMember \<role> \<index>   | Calls the read-only function "getRoleMember" on the contract.      |
| getRoleMemberCount \<role>       | Calls the read-only function "getRoleMemberCount" on the contract. |
| getRoleMembers \<role>           | Calls the read-only function "getRoleMembers" on the contract.     |
| hasRole \<role> \<account>       | Calls the read-only function "hasRole" on the contract.            |
| is-paused                        | get is paused boolean                                              |
| no-bal \<address>                | get node operator balance by address                               |
| no-g \<address>                  | get node operator guarantor                                        |
| supportsInterface \<interfaceId> | Calls the read-only function "supportsInterface" on the contract.  |
| un-bal \<address>                | get unlocked balance                                               |
| v-status \<pubkey>               | get validator status                                               |

### Write

| Command                                                             | Description                                    |
| ------------------------------------------------------------------- | ---------------------------------------------- |
| predeposit \<vault> \<deposits>                                     | predeposit                                     |
| verify-predeposit-bls verify-bls\<deposits>                         | Verifies BLS signature of the deposit          |
| proof-and-prove prove\<index>                                       | make proof and prove                           |
| prove-and-deposit \<indexes> \<vault> \<deposits>                   | prove and deposit                              |
| deposit-to-beacon-chain \<vault> \<deposits>                        | deposit to beacon chain                        |
| top-up \<nodeOperator> \<amount>                                    | top up no balance                              |
| prove-unknown-validator \<index> \<vault>                           | prove unknown validator                        |
| prove-invalid-validator-wc \<index> \<invalidWithdrawalCredentials> | prove invalid validator withdrawal credentials |
| withdraw-no-balance \<nodeOperator> \<amount> \<recipient>          | withdraw node operator balance                 |
| set-no-guarantor set-no-g\<guarantor>                               | set node operator guarantor                    |
| claim-guarantor-refund claim-g-refund\<recipient>                   | claim guarantor refund                         |
| compensate-disproven-predeposit compensate\<pubkey> \<recipient>    | compensate disproven predeposit                |

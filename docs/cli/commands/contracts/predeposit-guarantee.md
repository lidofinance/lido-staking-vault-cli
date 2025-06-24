---
sidebar_position: 3
---

# PredepositGuarantee

## Command

```bash
yarn start contracts pdg [arguments] [-options]
```

## PredepositGuarantee commands list

```bash
yarn start contracts pdg -h
```

## API

| Command   | Description    |
| --------- | -------------- |
| read (r)  | read commands  |
| write (w) | write commands |

### Read

| Command                                                                  | Description                                                                                        |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| info                                                                     | get PredepositGuarantee base info                                                                  |
| roles                                                                    | get PredepositGuarantee roles                                                                      |
| validator-status v-status\<validatorPubkey>                              | get validator status                                                                               |
| BEACON_ROOTS                                                             | get beacon roots address                                                                           |
| DEFAULT_ADMIN_ROLE                                                       | get default admin role                                                                             |
| DEPOSIT_DOMAIN                                                           | get predeposit role                                                                                |
| GI_FIRST_VALIDATOR_CURR                                                  | get GIndex of first validator in CL state tree after PIVOT_SLOT                                    |
| GI_FIRST_VALIDATOR_PREV                                                  | get GIndex of first validator in CL state tree                                                     |
| GI_PUBKEY_WC_PARENT                                                      | get pubkey wc parent gIndex                                                                        |
| GI_STATE_ROOT                                                            | get state root gIndex                                                                              |
| MAX_SUPPORTED_WC_VERSION                                                 | get max supported wc version                                                                       |
| MIN_SUPPORTED_WC_VERSION                                                 | get min supported wc version                                                                       |
| PAUSE_INFINITELY                                                         | get special value for the infinite pause                                                           |
| PAUSE_ROLE                                                               | get pause role                                                                                     |
| PIVOT_SLOT                                                               | get slot when GIndex change will occur due to the hardfork                                         |
| PREDEPOSIT_AMOUNT                                                        | get computed DEPOSIT_DOMAIN for current chain                                                      |
| RESUME_ROLE                                                              | get resume role                                                                                    |
| claimable-r \<guarantor>                                                 | get claimable refund                                                                               |
| resume-since-ts                                                          | get resume since timestamp                                                                         |
| getRoleAdmin \<role>                                                     | Calls the read-only function "getRoleAdmin" on the contract.                                       |
| getRoleMember \<role> \<index>                                           | Calls the read-only function "getRoleMember" on the contract.                                      |
| getRoleMemberCount \<role>                                               | Calls the read-only function "getRoleMemberCount" on the contract.                                 |
| getRoleMembers \<role>                                                   | Calls the read-only function "getRoleMembers" on the contract.                                     |
| hasRole \<role> \<account>                                               | Calls the read-only function "hasRole" on the contract.                                            |
| is-paused                                                                | get is paused boolean                                                                              |
| no-bal \<address>                                                        | get node operator balance by address                                                               |
| node-operator-depositor \<address>                                       | get address of the depositor for the NO                                                            |
| no-g \<address>                                                          | get node operator guarantor                                                                        |
| supportsInterface \<interfaceId>                                         | Calls the read-only function "supportsInterface" on the contract.                                  |
| un-bal \<address>                                                        | get unlocked balance                                                                               |
| validate-pubkey-wc-proof \<witness> \<withdrawal-credentials>            | validates proof of validator in CL with withdrawalCredentials and pubkey against Beacon block root |
| verify-deposit-message \<deposit> \<depositsY> \<withdrawal-credentials> | verifies the deposit message signature using BLS12-381 pairing check                               |

### Write

| Command                                                             | Description                                                                                       |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| predeposit \<vault> \<deposits>                                     | deposits NO's validators with PREDEPOSIT_AMOUNT ether from StakingVault and locks up NO's balance |
| proof-and-prove prove\<index>                                       | make proof and prove                                                                              |
| prove-and-deposit \<indexes> \<vault> \<deposits>                   | prove and deposit                                                                                 |
| deposit-to-beacon-chain \<vault> \<deposits>                        | deposit to beacon chain                                                                           |
| top-up \<nodeOperator> \<amount>                                    | top up no balance                                                                                 |
| prove-invalid-validator-wc \<index> \<invalidWithdrawalCredentials> | prove invalid validator withdrawal credentials                                                    |
| withdraw-no-balance \<nodeOperator> \<amount> \<recipient>          | withdraw node operator balance                                                                    |
| set-no-guarantor set-no-g\<guarantor>                               | set node operator guarantor                                                                       |
| claim-guarantor-refund claim-g-refund\<recipient>                   | claim guarantor refund                                                                            |
| compensate-disproven-predeposit compensate\<pubkey> \<recipient>    | compensate disproven predeposit                                                                   |

**\<deposits>**

```json
[{
  "pubkey": "...",
  "signature": "...",
  "amount": number,
  "deposit_data_root": "..."
}]
```

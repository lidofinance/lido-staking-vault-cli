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
| pending-activations pd\<vault>                                           | get the amount of ether that is pending as predeposits but not proved yet                          |
| ACTIVATION_DEPOSIT_AMOUNT                                                | get amount of ether to be deposited after the predeposit to activate the validator                 |
| BEACON_ROOTS                                                             | get beacon roots address                                                                           |
| DEFAULT_ADMIN_ROLE                                                       | get default admin role                                                                             |
| DEPOSIT_DOMAIN                                                           | get computed DEPOSIT_DOMAIN for current chain                                                      |
| GI_FIRST_VALIDATOR_CURR                                                  | get GIndex of first validator in CL state tree after PIVOT_SLOT                                    |
| GI_FIRST_VALIDATOR_PREV                                                  | get GIndex of first validator in CL state tree                                                     |
| GI_PUBKEY_WC_PARENT                                                      | get pubkey wc parent gIndex                                                                        |
| GI_STATE_ROOT                                                            | get state root gIndex                                                                              |
| MAX_SUPPORTED_WC_VERSION                                                 | get max supported wc version                                                                       |
| MAX_TOPUP_AMOUNT                                                         | Calls the read-only function "MAX_TOPUP_AMOUNT" on the contract.                                   |
| MIN_SUPPORTED_WC_VERSION                                                 | get min supported wc version                                                                       |
| PAUSE_INFINITELY                                                         | get special value for the infinite pause                                                           |
| PAUSE_ROLE                                                               | get pause role                                                                                     |
| PIVOT_SLOT                                                               | get slot when GIndex change will occur due to the hardfork                                         |
| PREDEPOSIT_AMOUNT                                                        | get amount of ether that is predeposited with each validator                                       |
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

| Command                                                             | Description                                                                                                        |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| predeposit \<vault> \<deposits>                                     | deposits NO's validators with PREDEPOSIT_AMOUNT ether from StakingVault and locks up NO's balance                  |
| proof-and-prove prove\<index>                                       | permissionless method to prove correct Withdrawal Credentials for the validator and to send the activation deposit |
| prove-and-top-up \<indexes> \<amounts>                              | prove validators to unlock NO balance, activate the validators from stash, and optionally top up NO balance        |
| top-up-existing-validators top-up-val\<topUps>                      | deposits ether to proven validators from staking vault                                                             |
| top-up-no \<nodeOperator> \<amount>                                 | top up Node Operator balance                                                                                       |
| prove-invalid-validator-wc \<index> \<invalidWithdrawalCredentials> | permissionless method to prove and compensate incorrect Withdrawal Credentials for the validator on CL             |
| withdraw-no-balance \<nodeOperator> \<amount> \<recipient>          | withdraw node operator balance                                                                                     |
| set-no-guarantor set-no-g\<guarantor>                               | set node operator guarantor                                                                                        |
| claim-guarantor-refund claim-g-refund\<recipient>                   | claim guarantor refund                                                                                             |

**\<deposits>**

```json
[{
  "pubkey": "...",
  "signature": "...",
  "amount": number,
  "deposit_data_root": "..."
}]
```

**\<topUps>**

```json
[{
  "pubkey": "...",
  "amount": number,
}]
```

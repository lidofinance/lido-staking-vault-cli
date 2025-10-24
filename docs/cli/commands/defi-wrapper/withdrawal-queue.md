---
sidebar_position: 1
---

# WithdrawalQueue

## Command

```bash
yarn start defi-wrapper contracts wq [arguments] [-options]
```

## WithdrawalQueue commands list

```bash
yarn start defi-wrapper contracts wq -h
```

## API

| Command   | Description    |
| --------- | -------------- |
| read (r)  | read commands  |
| write (w) | write commands |

### Read

| Command                                                                      | Description                                                                                                                                 |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| info \<address>                                                              | get withdrawal queue base info                                                                                                              |
| DASHBOARD \<address>                                                         | Calls the read-only function "DASHBOARD" on the contract.                                                                                   |
| DEFAULT_ADMIN_ROLE \<address>                                                | Calls the read-only function "DEFAULT_ADMIN_ROLE" on the contract.                                                                          |
| E27_PRECISION_BASE \<address>                                                | Calls the read-only function "E27_PRECISION_BASE" on the contract.                                                                          |
| E36_PRECISION_BASE \<address>                                                | Calls the read-only function "E36_PRECISION_BASE" on the contract.                                                                          |
| FINALIZE_ROLE \<address>                                                     | Calls the read-only function "FINALIZE_ROLE" on the contract.                                                                               |
| LAZY_ORACLE \<address>                                                       | Calls the read-only function "LAZY_ORACLE" on the contract.                                                                                 |
| MAX_ACCEPTABLE_WQ_FINALIZATION_TIME_IN_SECONDS \<address>                    | get max time for finalization of the withdrawal request                                                                                     |
| MAX_WITHDRAWAL_AMOUNT \<address>                                             | get max amount of assets that is possible to withdraw                                                                                       |
| MIN_WITHDRAWAL_AMOUNT \<address>                                             | get min amount of assets that is possible to withdraw                                                                                       |
| MIN_WITHDRAWAL_DELAY_TIME_IN_SECONDS \<address>                              | get min delay between withdrawal request and finalization                                                                                   |
| PAUSE_ROLE \<address>                                                        | Calls the read-only function "PAUSE_ROLE" on the contract.                                                                                  |
| RESUME_ROLE \<address>                                                       | Calls the read-only function "RESUME_ROLE" on the contract.                                                                                 |
| STAKING_VAULT \<address>                                                     | Calls the read-only function "STAKING_VAULT" on the contract.                                                                               |
| STETH \<address>                                                             | Calls the read-only function "STETH" on the contract.                                                                                       |
| VAULT_HUB \<address>                                                         | Calls the read-only function "VAULT_HUB" on the contract.                                                                                   |
| WRAPPER \<address>                                                           | Calls the read-only function "WRAPPER" on the contract.                                                                                     |
| calc-steth-share-rate \<address>                                             | get calculated current stETH share rate                                                                                                     |
| calc-stv-rate \<address>                                                     | get calculate current stv rate of the vault                                                                                                 |
| find-checkpoint-hints fch\<address> \<requestIds> \<firstIndex> \<lastIndex> | get the list of hints for the given `_requestIds` searching among the checkpoints with indices in the range [ `_firstIndex`, `_lastIndex` ] |
| get-claimable-ether \<address> \<requestIds> \<hints>                        | get amount of ether available for claim for each provided request id                                                                        |
| getClaimableEther_requestId \<address> \<\_requestId>                        | get amount of ether available for claim for each provided request id                                                                        |
| last-checkpoint-index lci\<address>                                          | get the last checkpoint index                                                                                                               |
| last-finalized-request-id lfri\<address>                                     | get the last finalized request id                                                                                                           |
| last-request-id lri\<address>                                                | get the last request id                                                                                                                     |
| getRoleAdmin \<address> \<role>                                              | Calls the read-only function "getRoleAdmin" on the contract.                                                                                |
| getRoleMember \<address> \<role> \<index>                                    | Calls the read-only function "getRoleMember" on the contract.                                                                               |
| getRoleMemberCount \<address> \<role>                                        | Calls the read-only function "getRoleMemberCount" on the contract.                                                                          |
| getRoleMembers \<address> \<role>                                            | Calls the read-only function "getRoleMembers" on the contract.                                                                              |
| get-withdrawal-requests \<address> \<owner> \<start> \<end>                  | get all withdrawal requests that belong to the `_owner` address                                                                             |
| getWithdrawalRequests_owner \<address> \<owner>                              | get all withdrawal requests that belong to the `_owner` address                                                                             |
| get-withdrawal-requests-length gwrl\<address> \<owner>                       | get the length of the withdrawal requests that belong to the `_owner` address.                                                              |
| w-status \<address> \<requestId>                                             | get the status for a single request                                                                                                         |
| w-statuses \<address> \<requestIds>                                          | get status for requests with provided ids                                                                                                   |
| hasRole \<address> \<role> \<account>                                        | Calls the read-only function "hasRole" on the contract.                                                                                     |
| is-ee-activated \<address>                                                   | get true if Emergency Exit is activated                                                                                                     |
| is-stuck \<address>                                                          | get true if requests have not been finalized for a long time                                                                                |
| paused \<address>                                                            | Calls the read-only function "paused" on the contract.                                                                                      |
| supportsInterface \<address> \<interfaceId>                                  | Calls the read-only function "supportsInterface" on the contract.                                                                           |
| unfinal-assets \<address>                                                    | get the amount of assets in the queue yet to be finalized                                                                                   |
| unfinal-request-number \<address>                                            | get the number of unfinalized requests in the queue                                                                                         |
| unfinal-stv \<address>                                                       | get the amount of stv in the queue yet to be finalized                                                                                      |

### Write

| Command                                                                       | Description                                                                     |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| pause \<address>                                                              | pause withdrawal requests placement and finalization                            |
| resume \<address>                                                             | resume withdrawal requests placement and finalization                           |
| request-withdrawals \<address> \<stv> \<steth> \<address>                     | request multiple withdrawals for a user                                         |
| request-withdrawal \<address> \<stv> \<steth> \<address>                      | request a withdrawal for a user                                                 |
| finalize \<address> \<maxRequests>                                            | finalize withdrawal requests                                                    |
| claim-withdrawal \<address> \<requestId> \<requestor> \<recipient>            | claim one `_requestId` request once finalized sending locked ether to the owner |
| claim-withdrawals \<address> \<requestIds> \<hints> \<requestor> \<recipient> | claim one `_requestId` request once finalized sending locked ether to the owner |

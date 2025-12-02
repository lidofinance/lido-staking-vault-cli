---
sidebar_position: 6
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

| Command                                                                           | Description                                                                    |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| info \<address>                                                                   | get withdrawal queue base info                                                 |
| DASHBOARD \<address>                                                              | Calls the read-only function "DASHBOARD" on the contract.                      |
| DEFAULT_ADMIN_ROLE \<address>                                                     | Calls the read-only function "DEFAULT_ADMIN_ROLE" on the contract.             |
| E27_PRECISION_BASE \<address>                                                     | Calls the read-only function "E27_PRECISION_BASE" on the contract.             |
| E36_PRECISION_BASE \<address>                                                     | Calls the read-only function "E36_PRECISION_BASE" on the contract.             |
| FINALIZE_FEATURE \<address>                                                       | Calls the read-only function "FINALIZE_FEATURE" on the contract.               |
| FINALIZE_PAUSE_ROLE \<address>                                                    | Calls the read-only function "FINALIZE_PAUSE_ROLE" on the contract.            |
| FINALIZE_RESUME_ROLE \<address>                                                   | Calls the read-only function "FINALIZE_RESUME_ROLE" on the contract.           |
| FINALIZE_ROLE \<address>                                                          | Calls the read-only function "FINALIZE_ROLE" on the contract.                  |
| IS_REBALANCING_SUPPORTED \<address>                                               | Calls the read-only function "IS_REBALANCING_SUPPORTED" on the contract.       |
| LAZY_ORACLE \<address>                                                            | Calls the read-only function "LAZY_ORACLE" on the contract.                    |
| MAX_GAS_COST_COVERAGE \<address>                                                  | Calls the read-only function "MAX_GAS_COST_COVERAGE" on the contract.          |
| MAX_WITHDRAWAL_ASSETS \<address>                                                  | Calls the read-only function "MAX_WITHDRAWAL_ASSETS" on the contract.          |
| MIN_WITHDRAWAL_DELAY_TIME_IN_SECONDS \<address>                                   | get min delay between withdrawal request and finalization                      |
| MIN_WITHDRAWAL_VALUE \<address>                                                   | Calls the read-only function "MIN_WITHDRAWAL_VALUE" on the contract.           |
| POOL \<address>                                                                   | Calls the read-only function "POOL" on the contract.                           |
| STETH \<address>                                                                  | Calls the read-only function "STETH" on the contract.                          |
| VAULT \<address>                                                                  | Calls the read-only function "VAULT" on the contract.                          |
| VAULT_HUB \<address>                                                              | Calls the read-only function "VAULT_HUB" on the contract.                      |
| WITHDRAWALS_FEATURE \<address>                                                    | Calls the read-only function "WITHDRAWALS_FEATURE" on the contract.            |
| WITHDRAWALS_PAUSE_ROLE \<address>                                                 | Calls the read-only function "WITHDRAWALS_PAUSE_ROLE" on the contract.         |
| WITHDRAWALS_RESUME_ROLE \<address>                                                | Calls the read-only function "WITHDRAWALS_RESUME_ROLE" on the contract.        |
| calc-steth-share-rate \<address>                                                  | get calculated current stETH share rate                                        |
| calc-stv-rate \<address>                                                          | get calculate current stv rate of the vault                                    |
| findCheckpointHint \<address> \<\_requestId> \<\_start> \<\_end>                  | Calls the read-only function "findCheckpointHint" on the contract.             |
| findCheckpointHintBatch \<address> \<\_requestIds> \<\_firstIndex> \<\_lastIndex> | Calls the read-only function "findCheckpointHintBatch" on the contract.        |
| get-claimable-ether \<address> \<\_requestId>                                     | get amount of ether available for claim for each provided request id           |
| getClaimableEtherBatch \<address> \<\_requestIds> \<\_hints>                      | Calls the read-only function "getClaimableEtherBatch" on the contract.         |
| getFinalizationGasCostCoverage \<address>                                         | Calls the read-only function "getFinalizationGasCostCoverage" on the contract. |
| last-checkpoint-index lci\<address>                                               | get the last checkpoint index                                                  |
| last-finalized-request-id lfri\<address>                                          | get the last finalized request id                                              |
| last-request-id lri\<address>                                                     | get the last request id                                                        |
| getRoleAdmin \<address> \<role>                                                   | Calls the read-only function "getRoleAdmin" on the contract.                   |
| getRoleMember \<address> \<role> \<index>                                         | Calls the read-only function "getRoleMember" on the contract.                  |
| getRoleMemberCount \<address> \<role>                                             | Calls the read-only function "getRoleMemberCount" on the contract.             |
| getRoleMembers \<address> \<role>                                                 | Calls the read-only function "getRoleMembers" on the contract.                 |
| w-status \<address> \<requestId>                                                  | get the status for a single request                                            |
| getWithdrawalStatusBatch \<address> \<\_requestIds>                               | Calls the read-only function "getWithdrawalStatusBatch" on the contract.       |
| hasRole \<address> \<role> \<account>                                             | Calls the read-only function "hasRole" on the contract.                        |
| isFeaturePaused \<address> \<\_featureId>                                         | Calls the read-only function "isFeaturePaused" on the contract.                |
| supportsInterface \<address> \<interfaceId>                                       | Calls the read-only function "supportsInterface" on the contract.              |
| unfinal-assets \<address>                                                         | get the amount of assets in the queue yet to be finalized                      |
| unfinalizedRequestsNumber \<address>                                              | Calls the read-only function "unfinalizedRequestsNumber" on the contract.      |
| unfinalizedStethShares \<address>                                                 | Calls the read-only function "unfinalizedStethShares" on the contract.         |
| unfinal-stv \<address>                                                            | get the amount of stv in the queue yet to be finalized                         |
| withdrawalRequestsInRangeOf \<address> \<\_owner> \<\_start> \<\_end>             | Calls the read-only function "withdrawalRequestsInRangeOf" on the contract.    |
| withdrawalRequestsLengthOf \<address> \<\_owner>                                  | Calls the read-only function "withdrawalRequestsLengthOf" on the contract.     |
| withdrawalRequestsOf \<address> \<\_owner>                                        | Calls the read-only function "withdrawalRequestsOf" on the contract.           |

### Write

| Command                                                          | Description                                                                     |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| pause \<address>                                                 | pause withdrawal requests placement and finalization                            |
| resume \<address>                                                | resume withdrawal requests placement and finalization                           |
| pause-finalization \<address>                                    | pause withdrawal requests finalization                                          |
| resume-finalization \<address>                                   | resume withdrawal requests finalization                                         |
| request-withdrawals \<address> \<stv> \<steth> \<address>        | request multiple withdrawals for a user                                         |
| request-withdrawal \<address> \<stv> \<steth> \<address>         | request a withdrawal for a user                                                 |
| finalize \<address> \<maxRequests> \<gasCostCoverageRecipient>   | finalize withdrawal requests                                                    |
| claim-withdrawal \<address> \<requestId> \<recipient>            | claim one `_requestId` request once finalized sending locked ether to the owner |
| claim-withdrawals \<address> \<requestIds> \<hints> \<recipient> | claim one `_requestId` request once finalized sending locked ether to the owner |

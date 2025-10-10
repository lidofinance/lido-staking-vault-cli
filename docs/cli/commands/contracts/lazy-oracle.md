---
sidebar_position: 8
---

# LazyOracle

## Command

```bash
yarn start contracts lazy-oracle [arguments] [-options]
```

## LazyOracle commands list

```bash
yarn start contracts lazy-oracle -h
```

## API

| Command  | Description   |
| -------- | ------------- |
| read (r) | read commands |

### Read

| Command                              | Description                                                                  |
| ------------------------------------ | ---------------------------------------------------------------------------- |
| info                                 | get lazy oracle base info                                                    |
| DEFAULT_ADMIN_ROLE                   | Calls the read-only function "DEFAULT_ADMIN_ROLE" on the contract.           |
| LIDO_LOCATOR                         | Calls the read-only function "LIDO_LOCATOR" on the contract.                 |
| MAX_LIDO_FEE_RATE_PER_SECOND         | Calls the read-only function "MAX_LIDO_FEE_RATE_PER_SECOND" on the contract. |
| MAX_QUARANTINE_PERIOD                | Calls the read-only function "MAX_QUARANTINE_PERIOD" on the contract.        |
| MAX_REWARD_RATIO                     | Calls the read-only function "MAX_REWARD_RATIO" on the contract.             |
| UPDATE_SANITY_PARAMS_ROLE            | Calls the read-only function "UPDATE_SANITY_PARAMS_ROLE" on the contract.    |
| batchValidatorStages \<\_pubkeys>    | Calls the read-only function "batchValidatorStages" on the contract.         |
| batch-vaults-info \<offset> \<limit> | get batch vaults info                                                        |
| getRoleAdmin \<role>                 | Calls the read-only function "getRoleAdmin" on the contract.                 |
| getRoleMember \<role> \<index>       | Calls the read-only function "getRoleMember" on the contract.                |
| getRoleMemberCount \<role>           | Calls the read-only function "getRoleMemberCount" on the contract.           |
| getRoleMembers \<role>               | Calls the read-only function "getRoleMembers" on the contract.               |
| hasRole \<role> \<account>           | Calls the read-only function "hasRole" on the contract.                      |
| latest-report-data lrd               | get latest report data                                                       |
| latest-report-timestamp lrt          | get latest report timestamp                                                  |
| max-lido-fee-rate-per-second max-lfs | get the max Lido fee rate per second, in ether                               |
| max-reward-ratio-bp mrr              | get max reward ratio                                                         |
| quarantine-period qp                 | get quarantine period                                                        |
| vaultInfo \<\_vault>                 | Calls the read-only function "vaultInfo" on the contract.                    |
| vault-quarantine vq\<vault>          | get vault quarantine                                                         |
| vaults-count vc                      | get vaults count                                                             |

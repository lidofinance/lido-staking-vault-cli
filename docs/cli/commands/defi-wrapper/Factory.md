---
sidebar_position: 1
---

# Factory

## Command

```bash
yarn start defi-wrapper contracts factory [arguments] [-options]
```

## Factory commands list

```bash
yarn start defi-wrapper contracts factory -h
```

## API

| Command   | Description    |
| --------- | -------------- |
| read (r)  | read commands  |
| write (w) | write commands |

### Read

| Command                              | Description                                                               |
| ------------------------------------ | ------------------------------------------------------------------------- |
| info \<address>                      | get factory base info                                                     |
| DUMMY_IMPLEMENTATION \<address>      | Calls the read-only function "DUMMY_IMPLEMENTATION" on the contract.      |
| GGV_STRATEGY_FACTORY \<address>      | Calls the read-only function "GGV_STRATEGY_FACTORY" on the contract.      |
| LAZY_ORACLE \<address>               | Calls the read-only function "LAZY_ORACLE" on the contract.               |
| LOOP_STRATEGY_FACTORY \<address>     | Calls the read-only function "LOOP_STRATEGY_FACTORY" on the contract.     |
| STETH \<address>                     | Calls the read-only function "STETH" on the contract.                     |
| STV_POOL_FACTORY \<address>          | Calls the read-only function "STV_POOL_FACTORY" on the contract.          |
| STV_STETH_POOL_FACTORY \<address>    | Calls the read-only function "STV_STETH_POOL_FACTORY" on the contract.    |
| STV_STRATEGY_POOL_FACTORY \<address> | Calls the read-only function "STV_STRATEGY_POOL_FACTORY" on the contract. |
| TIMELOCK_FACTORY \<address>          | Calls the read-only function "TIMELOCK_FACTORY" on the contract.          |
| TIMELOCK_MIN_DELAY \<address>        | Calls the read-only function "TIMELOCK_MIN_DELAY" on the contract.        |
| VAULT_FACTORY \<address>             | Calls the read-only function "VAULT_FACTORY" on the contract.             |
| WITHDRAWAL_QUEUE_FACTORY \<address>  | Calls the read-only function "WITHDRAWAL_QUEUE_FACTORY" on the contract.  |
| WSTETH \<address>                    | Calls the read-only function "WSTETH" on the contract.                    |

### Write

| Command                                                                                                                                                                                                                                                                 | Description                                    |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| create-vault-with-configured-wrapper \<address> \<nodeOperator> \<nodeOperatorManager> \<nodeOperatorFeeBP> \<confirmExpiry> \<maxFinalizationTime> \<minWithdrawalDelayTime> \<configuration> \<strategy> \<allowlistEnabled> \<reserveRatioGapBP> \<timelockExecutor> | create a new vault with a configured wrapper   |
| create-vault-with-no-minting-no-strategy \<address> \<nodeOperator> \<nodeOperatorManager> \<nodeOperatorFeeBP> \<confirmExpiry> \<maxFinalizationTime> \<minWithdrawalDelayTime> \<allowlistEnabled>                                                                   | create a new vault with no minting no strategy |
| create-vault-with-minting-no-strategy \<address> \<nodeOperator> \<nodeOperatorManager> \<nodeOperatorFeeBP> \<confirmExpiry> \<maxFinalizationTime> \<minWithdrawalDelayTime> \<allowlistEnabled> \<reserveRatioGapBP>                                                 | create a new vault with minting no strategy    |
| create-vault-with-loop-strategy \<address> \<nodeOperator> \<nodeOperatorManager> \<nodeOperatorFeeBP> \<confirmExpiry> \<maxFinalizationTime> \<minWithdrawalDelayTime> \<allowlistEnabled> \<reserveRatioGapBP> \<loops>                                              | create a new vault with loop strategy          |
| create-vault-with-ggv-strategy \<address> \<nodeOperator> \<nodeOperatorManager> \<nodeOperatorFeeBP> \<confirmExpiry> \<maxFinalizationTime> \<minWithdrawalDelayTime> \<allowlistEnabled> \<reserveRatioGapBP> \<teller> \<boringQueue>                               | create a new vault with ggv strategy           |

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

| Command                                                                                                                                                                                              | Description                                                                      |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| info \<address>                                                                                                                                                                                      | get factory base info                                                            |
| log-creating-pool-data \<creationTxHash> \<finalizationTxHash>                                                                                                                                       | log results of creation and finalization(if provided) transactions               |
| DEFAULT_ADMIN_ROLE \<address>                                                                                                                                                                        | Calls the read-only function "DEFAULT_ADMIN_ROLE" on the contract.               |
| DEPLOY_FINISHED \<address>                                                                                                                                                                           | Calls the read-only function "DEPLOY_FINISHED" on the contract.                  |
| DEPLOY_START_FINISH_SPAN_SECONDS \<address>                                                                                                                                                          | Calls the read-only function "DEPLOY_START_FINISH_SPAN_SECONDS" on the contract. |
| DISTRIBUTOR_FACTORY \<address>                                                                                                                                                                       | Calls the read-only function "DISTRIBUTOR_FACTORY" on the contract.              |
| DUMMY_IMPLEMENTATION \<address>                                                                                                                                                                      | Calls the read-only function "DUMMY_IMPLEMENTATION" on the contract.             |
| GGV_STRATEGY_FACTORY \<address>                                                                                                                                                                      | Calls the read-only function "GGV_STRATEGY_FACTORY" on the contract.             |
| LAZY_ORACLE \<address>                                                                                                                                                                               | Calls the read-only function "LAZY_ORACLE" on the contract.                      |
| STETH \<address>                                                                                                                                                                                     | Calls the read-only function "STETH" on the contract.                            |
| STRATEGY_POOL_TYPE \<address>                                                                                                                                                                        | Calls the read-only function "STRATEGY_POOL_TYPE" on the contract.               |
| STV_POOL_FACTORY \<address>                                                                                                                                                                          | Calls the read-only function "STV_POOL_FACTORY" on the contract.                 |
| STV_POOL_TYPE \<address>                                                                                                                                                                             | Calls the read-only function "STV_POOL_TYPE" on the contract.                    |
| STV_STETH_POOL_FACTORY \<address>                                                                                                                                                                    | Calls the read-only function "STV_STETH_POOL_FACTORY" on the contract.           |
| STV_STETH_POOL_TYPE \<address>                                                                                                                                                                       | Calls the read-only function "STV_STETH_POOL_TYPE" on the contract.              |
| TIMELOCK_FACTORY \<address>                                                                                                                                                                          | Calls the read-only function "TIMELOCK_FACTORY" on the contract.                 |
| TOTAL_BASIS_POINTS \<address>                                                                                                                                                                        | Calls the read-only function "TOTAL_BASIS_POINTS" on the contract.               |
| VAULT_FACTORY \<address>                                                                                                                                                                             | Calls the read-only function "VAULT_FACTORY" on the contract.                    |
| VAULT_HUB \<address>                                                                                                                                                                                 | Calls the read-only function "VAULT_HUB" on the contract.                        |
| WITHDRAWAL_QUEUE_FACTORY \<address>                                                                                                                                                                  | Calls the read-only function "WITHDRAWAL_QUEUE_FACTORY" on the contract.         |
| WSTETH \<address>                                                                                                                                                                                    | Calls the read-only function "WSTETH" on the contract.                           |
| \_hashDeploymentConfiguration \<address> \<\_sender> \<\_vaultConfig> \<\_commonPoolConfig> \<\_auxiliaryConfig> \<\_timelockConfig> \<\_strategyFactory> \<\_strategyDeployBytes> \<\_intermediate> | Calls the read-only function "\_hashDeploymentConfiguration" on the contract.    |
| derivePoolType \<address> \<\_auxiliaryConfig> \<\_strategyFactory>                                                                                                                                  | Calls the read-only function "derivePoolType" on the contract.                   |
| intermediateState \<address> \<param0>                                                                                                                                                               | Calls the read-only function "intermediateState" on the contract.                |

### Write

| Command                                                                        | Description                                                         |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| create-pool-stv \<factoryAddress>                                              | initiates deployment of a STV staking pool                          |
| create-pool-stv-steth \<factoryAddress>                                        | initiates deployment of a STV-STETH pool with minting enabled       |
| create-pool-custom \<factoryAddress>                                           | initiates deployment of a custom pool                               |
| create-strategy-pool-lido-earn-eth \<factoryAddress> \<strategyFactoryAddress> | initiates deployment of a strategy pool with Lido Earn ETH strategy |
| create-pool-finalize \<factoryAddress> \<TxHash>                               | finalizes deployment of a pool                                      |

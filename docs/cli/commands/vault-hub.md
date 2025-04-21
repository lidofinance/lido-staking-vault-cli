---
sidebar_position: 2
---

# VaultHub

## Command

```bash
lsv-cli hub [arguments] [-options]
```

## VaultHub commands list

```bash
lsv-cli hub -h
```

## API

| Command   | Description    |
| --------- | -------------- |
| read (r)  | read commands  |
| write (w) | write commands |

### Read

| Command                             | Description                                                                                                                         |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| info                                | get vault hub info                                                                                                                  |
| roles                               | get vault hub roles                                                                                                                 |
| CONNECT_DEPOSIT                     | Calls the read-only function "CONNECT_DEPOSIT" on the contract.                                                                     |
| DEFAULT_ADMIN_ROLE                  | Calls the read-only function "DEFAULT_ADMIN_ROLE" on the contract.                                                                  |
| LIDO                                | Calls the read-only function "LIDO" on the contract.                                                                                |
| LIDO_LOCATOR                        | Calls the read-only function "LIDO_LOCATOR" on the contract.                                                                        |
| PAUSE_INFINITELY                    | Calls the read-only function "PAUSE_INFINITELY" on the contract.                                                                    |
| PAUSE_ROLE                          | Calls the read-only function "PAUSE_ROLE" on the contract.                                                                          |
| REPORT_FRESHNESS_DELTA              | Calls the read-only function "REPORT_FRESHNESS_DELTA" on the contract.                                                              |
| RESUME_ROLE                         | Calls the read-only function "RESUME_ROLE" on the contract.                                                                         |
| VAULT_MASTER_ROLE                   | Calls the read-only function "VAULT_MASTER_ROLE" on the contract.                                                                   |
| VAULT_REGISTRY_ROLE                 | Calls the read-only function "VAULT_REGISTRY_ROLE" on the contract.                                                                 |
| batch-v-info \<offset> \<limit>     | get batch of vaults info                                                                                                            |
| getResumeSinceTimestamp             | Calls the read-only function "getResumeSinceTimestamp" on the contract.                                                             |
| getRoleAdmin \<role>                | Calls the read-only function "getRoleAdmin" on the contract.                                                                        |
| getRoleMember \<role> \<index>      | Calls the read-only function "getRoleMember" on the contract.                                                                       |
| getRoleMemberCount \<role>          | Calls the read-only function "getRoleMemberCount" on the contract.                                                                  |
| getRoleMembers \<role>              | Calls the read-only function "getRoleMembers" on the contract.                                                                      |
| hasRole \<role> \<account>          | Calls the read-only function "hasRole" on the contract.                                                                             |
| is-paused                           | get is paused boolean                                                                                                               |
| is-v-healthy-latest-report \<vault> | get checks if the vault is healthy by comparing its total value after applying rebalance threshold against current liability shares |
| latest-report-data                  | get latest report data                                                                                                              |
| operatorGrid                        | Calls the read-only function "operatorGrid" on the contract.                                                                        |
| rebalanceShortfall \<\_vault>       | Calls the read-only function "rebalanceShortfall" on the contract.                                                                  |
| supportsInterface \<interfaceId>    | Calls the read-only function "supportsInterface" on the contract.                                                                   |
| vault \<\_index>                    | Calls the read-only function "vault" on the contract.                                                                               |
| vault-socket-i \<index>             | get vault socket by index                                                                                                           |
| vaultSocket_vault \<\_vault>        | get vault socket by index                                                                                                           |
| v-count                             | get connected vaults count                                                                                                          |
| vi \<index>                         | get vault and vault socket by index                                                                                                 |
| rebalance-shortfall \<address>      | estimate ether amount to make the vault healthy using rebalance                                                                     |

### Write

| Command                                                                                                         | Description                                                                                     |
| --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| add-codehash \<codehash>                                                                                        | add vault proxy codehash to allowed list                                                        |
| v-connect \<address>                                                                                            | connects a vault to the hub (vault master role needed)                                          |
| v-update-share-limit \<address> \<shareLimit>                                                                   | updates share limit for the vault                                                               |
| v-disconnect \<address>                                                                                         | force disconnects a vault from the hub                                                          |
| v-owner-disconnect \<address>                                                                                   | disconnects a vault from the hub, msg.sender should be vault's owner                            |
| v-mint \<address> \<recipient> \<amountOfShares>                                                                | mint StETH shares backed by vault external balance to the receiver address                      |
| v-burn \<address> \<amountOfShares>                                                                             | burn steth shares from the balance of the VaultHub contract                                     |
| v-transfer-and-burn \<address> \<amountOfShares>                                                                | separate burn function for EOA vault owners; requires vaultHub to be approved to transfer stETH |
| v-force-rebalance \<address>                                                                                    | force rebalance of the vault to have sufficient reserve ratio                                   |
| v-update-connection \<address> \<shareLimit> \<reserveRatio> \<reserveRatioThreshold> \<treasuryFeeBP>          | updates the vault`s connection parameters                                                       |
| update-report-data \<vaultsDataTimestamp> \<vaultsDataTreeRoot> \<vaultsDataReportCid>                          | updates the report data for the vault                                                           |
| v-force-validator-exit \<vaultAddress> \<validatorPubkey> \<refundRecipient>                                    | force validator exit                                                                            |
| v-update-vault-data \<vaultAddress> \<totalValue> \<inOutDelta> \<feeSharesCharged> \<liabilityShares> \<proof> | permissionless update of the vault data                                                         |
| mint-vaults-treasury-fee-shares \<amountOfShares>                                                               | mint vaults treasury fee shares                                                                 |

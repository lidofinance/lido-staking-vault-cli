---
sidebar_position: 5
---

# VaultHub

## Command

```bash
yarn start contracts hub [arguments] [-options]
```

## VaultHub commands list

```bash
yarn start contracts hub -h
```

## API

| Command   | Description    |
| --------- | -------------- |
| read (r)  | read commands  |
| write (w) | write commands |

### Read

| Command                                               | Description                                                                           |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------- |
| info                                                  | get vault hub info                                                                    |
| roles                                                 | get vault hub roles                                                                   |
| BAD_DEBT_MASTER_ROLE                                  | Calls the read-only function "BAD_DEBT_MASTER_ROLE" on the contract.                  |
| CONNECT_DEPOSIT                                       | Calls the read-only function "CONNECT_DEPOSIT" on the contract.                       |
| CONSENSUS_CONTRACT                                    | Calls the read-only function "CONSENSUS_CONTRACT" on the contract.                    |
| DEFAULT_ADMIN_ROLE                                    | Calls the read-only function "DEFAULT_ADMIN_ROLE" on the contract.                    |
| LIDO                                                  | Calls the read-only function "LIDO" on the contract.                                  |
| LIDO_LOCATOR                                          | Calls the read-only function "LIDO_LOCATOR" on the contract.                          |
| MAX_RELATIVE_SHARE_LIMIT_BP                           | Calls the read-only function "MAX_RELATIVE_SHARE_LIMIT_BP" on the contract.           |
| PAUSE_INFINITELY                                      | Calls the read-only function "PAUSE_INFINITELY" on the contract.                      |
| PAUSE_ROLE                                            | Calls the read-only function "PAUSE_ROLE" on the contract.                            |
| REDEMPTION_MASTER_ROLE                                | Calls the read-only function "REDEMPTION_MASTER_ROLE" on the contract.                |
| REPORT_FRESHNESS_DELTA                                | Calls the read-only function "REPORT_FRESHNESS_DELTA" on the contract.                |
| RESUME_ROLE                                           | Calls the read-only function "RESUME_ROLE" on the contract.                           |
| VALIDATOR_EXIT_ROLE                                   | Calls the read-only function "VALIDATOR_EXIT_ROLE" on the contract.                   |
| VAULT_MASTER_ROLE                                     | Calls the read-only function "VAULT_MASTER_ROLE" on the contract.                     |
| bad-debt                                              | get the amount of bad debt to be internalized to become the protocol loss             |
| getResumeSinceTimestamp                               | Calls the read-only function "getResumeSinceTimestamp" on the contract.               |
| getRoleAdmin \<role>                                  | Calls the read-only function "getRoleAdmin" on the contract.                          |
| getRoleMember \<role> \<index>                        | Calls the read-only function "getRoleMember" on the contract.                         |
| getRoleMemberCount \<role>                            | Calls the read-only function "getRoleMemberCount" on the contract.                    |
| getRoleMembers \<role>                                | Calls the read-only function "getRoleMembers" on the contract.                        |
| hasRole \<role> \<account>                            | Calls the read-only function "hasRole" on the contract.                               |
| health-shortfall-shares \<vault>                      | get calculated shares amount to make the vault healthy using rebalance                |
| is-paused                                             | get is paused boolean                                                                 |
| isPendingDisconnect \<\_vault>                        | Calls the read-only function "isPendingDisconnect" on the contract.                   |
| is-report-fresh \<vault>                              | check if if the report for the vault is fresh, false otherwise                        |
| is-v-connected \<vault>                               | check if the vault is connected to the hub                                            |
| is-v-h \<vault>                                       | get is vault healthy boolean                                                          |
| latest-report-data \<vault>                           | get latest report for the vault                                                       |
| liability-shares \<vault>                             | get liability shares of the vault                                                     |
| locked \<vault>                                       | get llocked amount of ether for the vault                                             |
| max-lockable-value \<vault>                           | get the amount of ether that can be locked in the vault given the current total value |
| obligations \<vault>                                  | get the vault's current obligations toward the protocol                               |
| obligationsShortfallValue \<\_vault>                  | Calls the read-only function "obligationsShortfallValue" on the contract.             |
| settleableLidoFeesValue \<\_vault>                    | Calls the read-only function "settleableLidoFeesValue" on the contract.               |
| supportsInterface \<interfaceId>                      | Calls the read-only function "supportsInterface" on the contract.                     |
| totalMintingCapacityShares \<\_vault> \<\_deltaValue> | Calls the read-only function "totalMintingCapacityShares" on the contract.            |
| total-value \<vault>                                  | get total value of the vault (as of the latest report received)                       |
| v-by-index \<index>                                   | get the vault address by its index                                                    |
| v-connection \<vault>                                 | get connection parameters struct for the given vault                                  |
| v-record \<vault>                                     | get the accounting record struct for the given vault                                  |
| v-count                                               | get the number of vaults connected to the hub                                         |
| w-ether \<vault>                                      | get the amount of ether that can be instantly withdrawn from the staking vault        |
| vault-info-by-index vi\<index>                        | get vault and vault connection parameters by index                                    |

### Write

| Command                                                                                             | Description                                                                                                            |
| --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| v-connect \<address>                                                                                | connects a vault to the hub (vault master role needed)                                                                 |
| v-disconnect \<address>                                                                             | disconnect a vault from the hub. msg.sender must have VAULT_MASTER_ROLE. vault`s "liabilityShares" should be zero      |
| v-owner-disconnect \<address>                                                                       | disconnects a vault from the hub, msg.sender should be vault's owner                                                   |
| v-mint \<address> \<recipient> \<amountOfShares>                                                    | mint StETH shares backed by vault external balance to the receiver address                                             |
| v-burn \<address> \<amountOfShares>                                                                 | burn steth shares from the balance of the VaultHub contract                                                            |
| v-transfer-and-burn \<address> \<amountOfShares>                                                    | separate burn function for EOA vault owners; requires vaultHub to be approved to transfer stETH                        |
| v-force-rebalance \<address>                                                                        | force rebalance of the vault to have sufficient reserve ratio                                                          |
| v-rebalance \<vaultAddress> \<amount>                                                               | rebalances StakingVault by withdrawing ether to VaultHub. msg.sender should be vault`s owner                           |
| v-force-validator-exit \<vaultAddress> \<validatorPubkey> \<refundRecipient>                        | force validator exit                                                                                                   |
| transfer-vault-ownership \<vaultAddress> \<newOwner>                                                | transfer the ownership of the vault to a new owner                                                                     |
| fund-vault \<vaultAddress> \<amount>                                                                | funds the vault passing ether as msg.value                                                                             |
| withdraw-vault \<vaultAddress> \<amount> \<recipient>                                               | withdraws ether from the vault to the recipient address                                                                |
| pause-beacon-chain-deposits \<vaultAddress>                                                         | pauses beacon chain deposits for the vault                                                                             |
| resume-beacon-chain-deposits \<vaultAddress>                                                        | resumes beacon chain deposits for the vault                                                                            |
| request-validator-exit \<vaultAddress> \<validatorPubkeys>                                          | emits a request event for the node operator to perform validator exit                                                  |
| trigger-validator-withdrawals \<vaultAddress> \<validatorPubkeys> \<withdrawalAmounts> \<recipient> | triggers validator withdrawals for the vault using EIP-7002                                                            |
| prove-unknown-validator-to-pdg \<vaultAddress> \<validatorIndex>                                    | proves that validators unknown to PDG have correct WC to participate in the vault                                      |
| socialize-bad-debt \<badDebtVault> \<acceptorVault> \<maxSharesToSocialize>                         | transfer the bad debt from the donor vault to the acceptor vault. msg.sender must have BAD_DEBT_MASTER_ROLE            |
| internalize-bad-debt \<badDebtVault> \<maxSharesToInternalize>                                      | internalize the bad debt to the protocol. msg.sender must have BAD_DEBT_MASTER_ROLE                                    |
| settle-vault-obligations \<vaultAddress>                                                            | allows anyone to settle any outstanding Lido fees for a vault, sending them to the treasury. Requires the fresh report |

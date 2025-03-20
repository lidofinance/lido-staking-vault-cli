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

| Command                                                                                                  | Description                                                                                     |
| -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| constants                                                                                                | get vault hub constants                                                                         |
| dar                                                                                                      | get default admin role                                                                          |
| lido                                                                                                     | get lido address                                                                                |
| ll                                                                                                       | get lido locator address                                                                        |
| pi                                                                                                       | get pause infinitely                                                                            |
| pr                                                                                                       | get pause role                                                                                  |
| rr                                                                                                       | get resume role                                                                                 |
| vm-role                                                                                                  | get vault master role                                                                           |
| vr-role                                                                                                  | get vault registry role                                                                         |
| calc-t-fee \<r-val> \<socket> \<pre-t-shares> \<pre-t-pe> \<post-i-shares> \<post-i-ether> \<s-mlc-fees> | get calculated vault treasury fees                                                              |
| calc-v-rebase \<v-vals> \<pre-t-shares> \<pre-t-pe> \<post-i-shares> \<post-i-ether> \<s-mlc-fees>       | get calculated vaults rebase                                                                    |
| getResumeSinceTimestamp                                                                                  | Calls the read-only function "getResumeSinceTimestamp" on the contract.                         |
| getRoleAdmin \<role>                                                                                     | Calls the read-only function "getRoleAdmin" on the contract.                                    |
| getRoleMember \<role> \<index>                                                                           | Calls the read-only function "getRoleMember" on the contract.                                   |
| getRoleMemberCount \<role>                                                                               | Calls the read-only function "getRoleMemberCount" on the contract.                              |
| getRoleMembers \<role>                                                                                   | Calls the read-only function "getRoleMembers" on the contract.                                  |
| hasRole \<role> \<account>                                                                               | Calls the read-only function "hasRole" on the contract.                                         |
| is-paused                                                                                                | get is paused boolean                                                                           |
| is-v-h \<\_vault>                                                                                        | get is vault healthy boolean                                                                    |
| supportsInterface \<interfaceId>                                                                         | Calls the read-only function "supportsInterface" on the contract.                               |
| vault \<\_index>                                                                                         | Calls the read-only function "vault" on the contract.                                           |
| vaultSocket \<\_index>                                                                                   | Calls the read-only function "vaultSocket" on the contract.                                     |
| vaultSocket_vault \<\_vault>                                                                             | Calls the read-only function "vaultSocket" on the contract.                                     |
| v-count                                                                                                  | get connected vaults count                                                                      |
| vi \<index>                                                                                              | get vault and vault socket by index                                                             |
| add-codehash \<codehash>                                                                                 | add vault proxy codehash to allowed list                                                        |
| v-connect \<address> \<shareLimit> \<reserveRatio> \<reserveRatioThreshold> \<treasuryFeeBP>             | connects a vault to the hub (vault master role needed)                                          |
| v-update-share-limit \<address> \<shareLimit>                                                            | updates share limit for the vault                                                               |
| v-disconnect \<address>                                                                                  | force disconnects a vault from the hub                                                          |
| v-owner-disconnect \<address>                                                                            | disconnects a vault from the hub, msg.sender should be vault's owner                            |
| v-mint \<address> \<recipient> \<amountOfShares>                                                         | mint StETH shares backed by vault external balance to the receiver address                      |
| v-burn \<address> \<amountOfShares>                                                                      | burn steth shares from the balance of the VaultHub contract                                     |
| v-transfer-and-burn \<address> \<amountOfShares>                                                         | separate burn function for EOA vault owners; requires vaultHub to be approved to transfer stETH |
| v-force-rebalance \<address>                                                                             | force rebalance of the vault to have sufficient reserve ratio                                   |

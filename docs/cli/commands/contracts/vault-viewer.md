---
sidebar_position: 6
---

# VaultViewer

## Command

```bash
yarn start v-v [arguments] [-options]
```

## VaultViewer commands list

```bash
yarn start v-v -h
```

## API

| Command  | Description   |
| -------- | ------------- |
| read (r) | read commands |

### Read

| Command                                                      | Description                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------------- |
| DEFAULT_ADMIN_ROLE                                           | Calls the read-only function "DEFAULT_ADMIN_ROLE" on the contract.  |
| LAZY_ORACLE                                                  | Calls the read-only function "LAZY_ORACLE" on the contract.         |
| LIDO_LOCATOR                                                 | Calls the read-only function "LIDO_LOCATOR" on the contract.        |
| VAULT_HUB                                                    | Calls the read-only function "VAULT_HUB" on the contract.           |
| getRoleMembers \<vaultAddress> \<roles>                      | Calls the read-only function "getRoleMembers" on the contract.      |
| getRoleMembersBatch \<vaultAddresses> \<roles>               | Calls the read-only function "getRoleMembersBatch" on the contract. |
| getVaultData \<vault>                                        | Calls the read-only function "getVaultData" on the contract.        |
| getVaultsDataBound \<\_from> \<\_to>                         | Calls the read-only function "getVaultsDataBound" on the contract.  |
| has-role \<vault> \<member> \<role>                          | check if an address has a role in a vault                           |
| isContract \<account>                                        | Calls the read-only function "isContract" on the contract.          |
| is-owner \<vault> \<owner>                                   | check if an address is the owner of a vault                         |
| by-owner \<owner>                                            | get vaults by owner                                                 |
| by-owner-bound \<owner> \<from> \<to>                        | get vaults by owner - bound                                         |
| by-role-address by-ra\<role> \<member>                       | get vaults by role and address                                      |
| by-role-address-bound by-ra-b\<role> \<member> \<from> \<to> | get vaults by role and address - bound                              |
| connected-bound \<from> \<to>                                | get vaults connected to vault hub - bound                           |
| my                                                           | get my vaults                                                       |
| my-bound \<from> \<to>                                       | get my vaults - bound                                               |
| my-by-role \<role>                                           | get my vaults by role                                               |
| my-by-role-bound \<from> \<to>                               | get my vaults by role - bound                                       |
| connected                                                    | get vaults connected to vault hub                                   |

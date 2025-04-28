---
sidebar_position: 9
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

| Command                                                      | Description                                                        |
| ------------------------------------------------------------ | ------------------------------------------------------------------ |
| DEFAULT_ADMIN_ROLE                                           | Calls the read-only function "DEFAULT_ADMIN_ROLE" on the contract. |
| has-role \<vault> \<member> \<role>                          | check if an address has a role in a vault                          |
| isContract \<account>                                        | Calls the read-only function "isContract" on the contract.         |
| is-owner \<vault> \<owner>                                   | check if an address is the owner of a vault                        |
| vaultHub                                                     | Calls the read-only function "vaultHub" on the contract.           |
| by-owner \<owner>                                            | get vaults by owner                                                |
| by-owner-bound \<owner> \<from> \<to>                        | get vaults by owner - bound                                        |
| by-role-address by-ra\<role> \<member>                       | get vaults by role and address                                     |
| by-role-address-bound by-ra-b\<role> \<member> \<from> \<to> | get vaults by role and address - bound                             |
| connected                                                    | get vaults connected to vault hub                                  |
| connected-bound \<from> \<to>                                | get vaults connected to vault hub - bound                          |
| my                                                           | get my vaults                                                      |
| my-bound \<from> \<to>                                       | get my vaults - bound                                              |
| my-by-role \<role>                                           | get my vaults by role                                              |
| my-by-role-bound \<from> \<to> \<to>                         | get my vaults by role - bound                                      |

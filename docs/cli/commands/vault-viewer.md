---
sidebar_position: 9
---

# VaultViewer

## Command

```bash
lsv-cli vv [arguments] [-options]
```

## VaultViewer commands list

```bash
lsv-cli vv -h
```

## API

| Command                                     | Description                                                        |
| ------------------------------------------- | ------------------------------------------------------------------ |
| DEFAULT_ADMIN_ROLE                          | Calls the read-only function "DEFAULT_ADMIN_ROLE" on the contract. |
| hasRole \<vault> \<\_member> \<\_role>      | Calls the read-only function "hasRole" on the contract.            |
| isContract \<account>                       | Calls the read-only function "isContract" on the contract.         |
| isOwner \<vault> \<\_owner>                 | Calls the read-only function "isOwner" on the contract.            |
| vaultHub                                    | Calls the read-only function "vaultHub" on the contract.           |
| by-owner \<owner>                           | get vaults by owner                                                |
| by-owner-bound \<owner> \<from> \<to>       | get vaults by owner - bound                                        |
| by-ra \<role> \<member>                     | get vaults by role and address                                     |
| by-ra-bound \<role> \<member> \<from> \<to> | get vaults by role and address - bound                             |
| connected                                   | get vaults connected to vault hub                                  |
| connected-bound \<from> \<to>               | get vaults connected to vault hub - bound                          |
| my                                          | get my vaults                                                      |
| my-bound \<from> \<to>                      | get my vaults - bound                                              |
| my-by-role \<role>                          | get my vaults by role                                              |
| my-by-role-bound \<role> \<from> \<to>      | get my vaults by role - bound                                      |

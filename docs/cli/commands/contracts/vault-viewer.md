---
sidebar_position: 6
---

# VaultViewer

## Command

```bash
yarn start contracts v-v [arguments] [-options]
```

## VaultViewer commands list

```bash
yarn start contracts v-v -h
```

## API

| Command  | Description   |
| -------- | ------------- |
| read (r) | read commands |

### Read

| Command                                                         | Description                                                                       |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| DEFAULT_ADMIN_ROLE                                              | Calls the read-only function "DEFAULT_ADMIN_ROLE" on the contract.                |
| LAZY_ORACLE                                                     | Calls the read-only function "LAZY_ORACLE" on the contract.                       |
| LIDO_LOCATOR                                                    | Calls the read-only function "LIDO_LOCATOR" on the contract.                      |
| VAULT_HUB                                                       | Calls the read-only function "VAULT_HUB" on the contract.                         |
| has-role \<vault> \<role> \<member>                             | check if an address has a role in a vault                                         |
| isContract \<account>                                           | Calls the read-only function "isContract" on the contract.                        |
| is-vault-owner \<vault address> \<owner>                        | checks if a given address is the owner of a connection vault                      |
| role-members \<vault> \<roles>                                  | get the VaultMembers for each specified role on a single vault                    |
| role-members-batch \<vault addresses> \<roles>                  | get VaultMembers for each role on multiple vaults                                 |
| vault-data \<vault>                                             | get aggregated data for a single vault                                            |
| by-owner-batch \<owner> \<offset> \<limit>                      | get vaults owned by `_owner` using batch pagination over the global vault list    |
| by-role-address-batch (by-ra) \<role> \<member> \<offset> \<limit> | get vaults where `_member` has `_role`, scanning a batch of the global vault list |
| vaults-count                                                    | get the number of vaults connected to the VaultHub                                |
| vaults-data-batch \<offset> \<limit>                            | get aggregated data for a batch of vaults                                         |
| my                                                              | get all my vaults                                                                 |
| my-by-role \<role>                                              | get all vaults where I have a role                                                |
| all                                                             | get all vaults connected to vault hub                                             |

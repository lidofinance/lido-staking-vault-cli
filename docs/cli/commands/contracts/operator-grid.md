---
sidebar_position: 2
---

# OperatorGrid

## Command

```bash
yarn start contracts operator-grid [arguments] [-options]
```

## OperatorGrid commands list

```bash
yarn start contracts operator-grid -h
```

## API

| Command   | Description    |
| --------- | -------------- |
| read (r)  | read commands  |
| write (w) | write commands |

### Read

| Command                           | Description                                                                                   |
| --------------------------------- | --------------------------------------------------------------------------------------------- |
| info                              | get operator grid base info                                                                   |
| roles                             | get operator grid roles                                                                       |
| DEFAULT_ADMIN_ROLE                | Calls the read-only function "DEFAULT_ADMIN_ROLE" on the contract.                            |
| DEFAULT_TIER_ID                   | Calls the read-only function "DEFAULT_TIER_ID" on the contract.                               |
| DEFAULT_TIER_OPERATOR             | Calls the read-only function "DEFAULT_TIER_OPERATOR" on the contract.                         |
| LIDO_LOCATOR                      | Calls the read-only function "LIDO_LOCATOR" on the contract.                                  |
| max-confirm-expiry                | get max confirm expiry                                                                        |
| min-confirm-expiry                | get min confirm expiry                                                                        |
| REGISTRY_ROLE                     | Calls the read-only function "REGISTRY_ROLE" on the contract.                                 |
| confirmation \<call-data> \<role> | get confirmation by role and call data                                                        |
| effective-share-limit \<vault>    | get the effective share limit of a vault according to the OperatorGrid and vault share limits |
| get-confirm-expiry                | get confirm expiry                                                                            |
| getRoleAdmin \<role>              | Calls the read-only function "getRoleAdmin" on the contract.                                  |
| getRoleMember \<role> \<index>    | Calls the read-only function "getRoleMember" on the contract.                                 |
| getRoleMemberCount \<role>        | Calls the read-only function "getRoleMemberCount" on the contract.                            |
| getRoleMembers \<role>            | Calls the read-only function "getRoleMembers" on the contract.                                |
| group \<node-operator>            | get group by node operator address                                                            |
| hasRole \<role> \<account>        | Calls the read-only function "hasRole" on the contract.                                       |
| node-operator-address \<index>    | get node operator address by index                                                            |
| node-operator-count               | get node operator count                                                                       |
| supportsInterface \<interfaceId>  | Calls the read-only function "supportsInterface" on the contract.                             |
| tier \<id>                        | get tier by ID                                                                                |
| tiers-count                       | get a tiers count                                                                             |
| vault-info \<\_vault>             | get vault limits                                                                              |

### Write

| Command                                                         | Description                                    |
| --------------------------------------------------------------- | ---------------------------------------------- |
| register-group rg\<nodeOperator> \<shareLimit>                  | register a group                               |
| update-group-share-limit update-sl\<nodeOperator> \<shareLimit> | update group share limit                       |
| register-tiers rt\<nodeOperator> \<tiers>                       | register new tiers                             |
| alter-tiers at\<tierIds> \<tiers>                               | alters multiple tiers                          |
| change-tier ct\<vault> \<tierId> \<requestedShareLimit>         | vault tier change with multi-role confirmation |
| confirm-tier-change                                             | Confirms a tier change proposal                |

---
sidebar_position: 11
---

# OperatorGrid

## Command

```bash
yarn start operator-grid [arguments] [-options]
```

## OperatorGrid commands list

```bash
yarn start operator-grid -h
```

## API

| Command   | Description    |
| --------- | -------------- |
| read (r)  | read commands  |
| write (w) | write commands |

### Read

| Command                                   | Description                                                           |
| ----------------------------------------- | --------------------------------------------------------------------- |
| info                                      |                                                                       |
| roles                                     |                                                                       |
| DEFAULT_ADMIN_ROLE                        | Calls the read-only function "DEFAULT_ADMIN_ROLE" on the contract.    |
| DEFAULT_TIER_ID                           | Calls the read-only function "DEFAULT_TIER_ID" on the contract.       |
| DEFAULT_TIER_OPERATOR                     | Calls the read-only function "DEFAULT_TIER_OPERATOR" on the contract. |
| LIDO_LOCATOR                              | Calls the read-only function "LIDO_LOCATOR" on the contract.          |
| REGISTRY_ROLE                             | Calls the read-only function "REGISTRY_ROLE" on the contract.         |
| getRoleAdmin \<role>                      | Calls the read-only function "getRoleAdmin" on the contract.          |
| getRoleMember \<role> \<index>            | Calls the read-only function "getRoleMember" on the contract.         |
| getRoleMemberCount \<role>                | Calls the read-only function "getRoleMemberCount" on the contract.    |
| getRoleMembers \<role>                    | Calls the read-only function "getRoleMembers" on the contract.        |
| group \<node-operator>                    | get group by node operator address                                    |
| hasRole \<role> \<account>                | Calls the read-only function "hasRole" on the contract.               |
| node-operator-address \<index>            | get node operator address by index                                    |
| node-operator-count                       | get node operator count                                               |
| pending-request \<node-operator> \<index> | get pending request for a node operator by index                      |
| pending-requests \<node-operator>         | get pending requests for a node operator                              |
| pending-requests-count \<node-operator>   | get pending requests count for a node operator                        |
| supportsInterface \<interfaceId>          | Calls the read-only function "supportsInterface" on the contract.     |
| tier \<id>                                | get tier by ID                                                        |
| vault-info \<vault-address>               | get vault limits                                                      |

### Write

| Command                                                         | Description              |
| --------------------------------------------------------------- | ------------------------ |
| register-group rg\<nodeOperator> \<shareLimit>                  | register a group         |
| update-group-share-limit update-sl\<nodeOperator> \<shareLimit> | update group share limit |
| register-tiers rt\<nodeOperator> \<tiers>                       | register new tiers       |
| alter-tier at\<tierId> \<tier>                                  | alter tier               |
| request-tier-change rtc\<vault> \<tierId>                       | request tier change      |
| confirm-tier-change ctc\<vault> \<tierId>                       | confirm tier change      |

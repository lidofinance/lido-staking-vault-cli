---
sidebar_position: 11
---

# OperatorGrid

## Command

```bash
lsv-cli operator-grid [arguments] [-options]
```

## OperatorGrid commands list

```bash
lsv-cli operator-grid -h
```

## API

| Command                                                         | Description                                                        |
| --------------------------------------------------------------- | ------------------------------------------------------------------ |
| default-admin-role                                              | get default admin role                                             |
| default-tier-address                                            | get default tier address                                           |
| default-tier-id                                                 | get default tier id                                                |
| lido-locator                                                    | get lido locator address                                           |
| registry-role                                                   | get registry role                                                  |
| getRoleAdmin \<role>                                            | Calls the read-only function "getRoleAdmin" on the contract.       |
| getRoleMember \<role> \<index>                                  | Calls the read-only function "getRoleMember" on the contract.      |
| getRoleMemberCount \<role>                                      | Calls the read-only function "getRoleMemberCount" on the contract. |
| getRoleMembers \<role>                                          | Calls the read-only function "getRoleMembers" on the contract.     |
| group \<node-operator>                                          | get group by node operator address                                 |
| hasRole \<role> \<account>                                      | Calls the read-only function "hasRole" on the contract.            |
| node-operator-address \<index>                                  | get node operator address by index                                 |
| node-operator-count                                             | get node operator count                                            |
| pending-request \<node-operator> \<index>                       | get pending request for a node operator by index                   |
| pending-requests \<node-operator>                               | get pending requests for a node operator                           |
| pending-requests-count \<node-operator>                         | get pending requests count for a node operator                     |
| supportsInterface \<interfaceId>                                | Calls the read-only function "supportsInterface" on the contract.  |
| tier \<id>                                                      | get tier by ID                                                     |
| vault-info \<vault-address>                                     | get vault limits                                                   |
| register-group rg\<nodeOperator> \<shareLimit>                  | register a group                                                   |
| update-group-share-limit update-sl\<nodeOperator> \<shareLimit> | update group share limit                                           |
| register-tiers rt\<nodeOperator> \<tiers>                       | register new tiers                                                 |
| alter-tier at\<tierId> \<tier>                                  | alter tier                                                         |
| request-tier-change rtc\<vault> \<tierId>                       | request tier change                                                |
| confirm-tier-change ctc\<vault> \<tierId>                       | confirm tier change                                                |

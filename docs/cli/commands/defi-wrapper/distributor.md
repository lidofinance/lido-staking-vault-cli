---
sidebar_position: 1
---

# Distributor

## Command

```bash
yarn start defi-wrapper contracts distributor [arguments] [-options]
```

## Distributor commands list

```bash
yarn start defi-wrapper contracts distributor -h
```

## API

| Command   | Description    |
| --------- | -------------- |
| read (r)  | read commands  |
| write (w) | write commands |

### Read

| Command                                     | Description                                                        |
| ------------------------------------------- | ------------------------------------------------------------------ |
| info \<address>                             | get distributor base info                                          |
| DEFAULT_ADMIN_ROLE \<address>               | get the default admin role                                         |
| MANAGER_ROLE \<address>                     | get the manager role                                               |
| cid \<address>                              | get IPFS CID of the last published Merkle tree                     |
| claimed \<address> \<account> \<token>      | get claimed amounts by account and token                           |
| getRoleAdmin \<address> \<role>             | Calls the read-only function "getRoleAdmin" on the contract.       |
| getRoleMember \<address> \<role> \<index>   | Calls the read-only function "getRoleMember" on the contract.      |
| getRoleMemberCount \<address> \<role>       | Calls the read-only function "getRoleMemberCount" on the contract. |
| getRoleMembers \<address> \<role>           | Calls the read-only function "getRoleMembers" on the contract.     |
| get-tokens \<address>                       | get the list of supported tokens                                   |
| hasRole \<address> \<role> \<account>       | Calls the read-only function "hasRole" on the contract.            |
| last-processed-block \<address>             | get the last processed block number for user tracking              |
| root \<address>                             | get the Merkle root of the distribution                            |
| supportsInterface \<address> \<interfaceId> | Calls the read-only function "supportsInterface" on the contract.  |

### Write

| Command                                                   | Description                                 |
| --------------------------------------------------------- | ------------------------------------------- |
| add-token \<address> \<token>                             | add a token to the list of supported tokens |
| set-merkle-root \<address> \<root> \<cid>                 | sets the Merkle root and CID                |
| claim \<address> \<recipient> \<token> \<amount> \<proof> | claims rewards                              |

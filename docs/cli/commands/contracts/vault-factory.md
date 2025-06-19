---
sidebar_position: 4
---

# VaultFactory

## Command

```bash
yarn start contracts factory [arguments] [-options]
```

## VaultFactory commands list

```bash
yarn start contracts factory -h
```

## API

| Command   | Description    |
| --------- | -------------- |
| read (r)  | read commands  |
| write (w) | write commands |

### Read

| Command        | Description                                                    |
| -------------- | -------------------------------------------------------------- |
| info           | get vault factory info                                         |
| BEACON         | Calls the read-only function "BEACON" on the contract.         |
| DASHBOARD_IMPL | Calls the read-only function "DASHBOARD_IMPL" on the contract. |
| LIDO_LOCATOR   | Calls the read-only function "LIDO_LOCATOR" on the contract.   |

### Write

| Command                                                                                                                                  | Description                                                                       |
| ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| create-vault \<defaultAdmin> \<nodeOperator> \<nodeOperatorManager> \<confirmExpiry> \<nodeOperatorFeeBP> \<quantity>                    | creates a new StakingVault and Dashboard contracts                                |
| create-vault-without-connecting \<defaultAdmin> \<nodeOperator> \<nodeOperatorManager> \<confirmExpiry> \<nodeOperatorFeeBP> \<quantity> | creates a new StakingVault and Dashboard contracts without connecting to VaultHub |

Note: `[quantity]` is an optional argument. The default value is `1`.
**[options]**

| Option                            | Description                              |
| --------------------------------- | ---------------------------------------- |
| -r, --roles \<roleAssignmentJSON> | The optional role assignments to be made |

**\<roleAssignmentJSON>**

```json
[{
  "account": string as Address;
  "role": string as `0x${string}`;
}]
```

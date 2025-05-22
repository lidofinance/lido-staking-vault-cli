---
sidebar_position: 3
---

# VaultFactory

## Command

```bash
yarn start factory [arguments] [-options]
```

## VaultFactory commands list

```bash
yarn start factory -h
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

| Command                                                                                                               | Description                              |
| --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| create-vault \<defaultAdmin> \<nodeOperator> \<nodeOperatorManager> \<confirmExpiry> \<nodeOperatorFeeBP> \<quantity> | create vault contract with deposit 1 ETH |

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

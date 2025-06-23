---
sidebar_position: 2
---

# Creating a Vault

Creates new StakingVault and Dashboard contracts with specified configuration.

```bash
yarn start vo w create-vault
```

**Sub-commands:**

- `create`: Creates vault and connects to VaultHub
- `create-without-connecting`: Creates vault without VaultHub connection

**Arguments:**

- `[quantity]`: Number of vaults to create (default: 1)

**Options:**

- `-da, --defaultAdmin <address>`: Default admin address
- `-no, --nodeOperator <address>`: Node operator address
- `-nom, --nodeOperatorManager <address>`: Node operator manager address
- `-ce, --confirmExpiry <number>`: Confirmation expiry time
- `-nof, --nodeOperatorFeeRate <number>`: Node operator fee rate (e.g., 100 = 1%)
- `-r, --roles <json>`: Additional role assignments

**Process:**

- Validates all addresses and parameters
- Displays creation confirmation with all settings
- Deploys new StakingVault and Dashboard contracts
- Assigns specified roles and permissions
- Optionally connects to VaultHub

**Returns:**

- Vault contract address
- Dashboard contract address
- Transaction hash and block number

**\<roleAssignmentJSON>**

```
'[{
  "account": string as Address;
  "role": string as `0x${string}`;
}, ...]'
```

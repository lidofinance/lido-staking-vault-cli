---
sidebar_position: 2
---

# Creating a Vault

```bash
yarn start factory w create-vault <defaultAdmin> <nodeOperator> <nodeOperatorManager> <confirmExpiry> <nodeOperatorFeeBP> <quantity>
```

## Required

- `<defaultAdmin>`: The address of the default admin of the Dashboard contract
- `<nodeOperator>`: The address of the node operator of the StakingVault
- `<nodeOperatorManager>`: The address of the node operator manager in the Dashboard
- `<confirmExpiry>`: Confirmation expiry in seconds; after this period, the confirmation expires and no longer counts
- `<nodeOperatorFeeBP>`: The node operator fee in basis points

## Optional

- `<quantity>`: Quantity of vaults to create, default 1 (default: "1")
- `-r, --roles <roleAssignmentJSON>`: Other roles to assign to the vault

**\<roleAssignmentJSON>**

```
'[{
  "account": string as Address;
  "role": string as `0x${string}`;
}, ...]'
```

## Example

```bash
yarn start factory w create-vault 0x 0x 0x 604800 100
```

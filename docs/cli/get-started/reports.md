---
sidebar_position: 5
---

# Reports

## Fetch report by Vault

```bash
yarn start report r by-vault <vault_address>
```

### Required

- `<vault_address>`: Vault address

### Example

```bash
yarn start report r by-vault 0x
```

## Submit by Vault

```bash
yarn start report w submit <vault_address>
```

### Required

- `<vault_address>`: Vault address

### Example

```bash
yarn start report w submit 0x
```

## Submit by Vaults

Submit reports for more than 1 vault:

```bash
yarn start report w by-vaults-submit <vaults...>
```

### Required

- `<vaults...>`: Array of Vault addresses

### Example

```bash
yarn start report w by-vaults-submit 0x 0x 0x
```

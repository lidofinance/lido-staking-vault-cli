---
sidebar_position: 2
---

# Get Started

## Configuration

[Configuration page](./configuration.md)

## Creating a Vault

```bash
yarn start factory w create-vault <defaultAdmin> <nodeOperator> <nodeOperatorManager> <confirmExpiry> <nodeOperatorFeeBP> <quantity>
```

### Required

- `<defaultAdmin>`: The address of the default admin of the Dashboard contract
- `<nodeOperator>`: The address of the node operator of the StakingVault
- `<nodeOperatorManager>`: The address of the node operator manager in the Dashboard
- `<confirmExpiry>`: Confirmation expiry in seconds; after this period, the confirmation expires and no longer counts
- `<nodeOperatorFeeBP>`: The node operator fee in basis points

### Optional

- `<quantity>`: Quantity of vaults to create, default 1 (default: "1")
- `-r, --roles <roleAssignmentJSON>`: Other roles to assign to the vault

**\<roleAssignmentJSON>**

```
'[{
  "account": string as Address;
  "role": string as `0x${string}`;
}, ...]'
```

### Example

```bash
yarn start factory w create-vault 0x 0x 0x 604800 100
```

## Supply (Fund) and Withdrawal

### Supply (Fund)

Fund your vault:

```bash
yarn start dashboard w fund <dashboard_address> <ether>
```

#### Required

- `<dashboard_address>`: Dashboard address
- `<ether>`: Amount of ether to be funded (in ETH)

#### Example

```bash
yarn start dashboard w fund 0x 1
```

### Withdrawal

Withdraw funds from your vault:

```bash
yarn start dashboard w withdraw <dashboard_address> <recipient_address> <ether>
```

#### Required

- `<dashboard_address>`: Dashboard address
- `<recipient_address>`: Address of the recipient
- `<ether>`: Amount of ether to be funded (in ETH)

#### Example

```bash
yarn start dashboard w withdraw 0x 0x 5
```

## Mint and Burn Tokens

### Mint Shares

Mint shares (in stETH):

```bash
yarn start dashboard w mint <dashboard_address> <recipient_address> <amountOfShares>
```

#### Required

- `<dashboard_address>`: Dashboard address
- `<recipient_address>`: Address of the recipient
- `<amountOfShares>`: Amount of shares to mint (in Shares)

#### Example

```bash
yarn start dashboard w mint 0x 0x 1
```

### Mint stETH

Mint tokens (in stETH):

```bash
yarn start dashboard w mint-steth <dashboard_address> <recipient_address> <amountOfSteth>
```

#### Required

- `<dashboard_address>`: Dashboard address
- `<recipient_address>`: Address of the recipient
- `<amountOfSteth>`: Amount of stETH to mint (in stETH)

#### Example

```bash
yarn start dashboard w mint-steth 0x 0x 1
```

### Mint wstETH

Mint tokens (in wstETH):

```bash
yarn start dashboard w mint-wsteth <dashboard_address> <recipient_address> <amountOfWsteth>
```

#### Required

- `<dashboard_address>`: Dashboard address
- `<recipient_address>`: Address of the recipient
- `<amountOfWsteth>`: Amount of wstETH to mint (in wstETH)

#### Example

```bash
yarn start dashboard w mint-wsteth 0x 0x 1
```

### Burn Shares

Burn tokens (in Shares):

```bash
yarn start dashboard w burn <dashboard_address> <amountOfShares>
```

#### Required

- `<dashboard_address>`: Dashboard address
- `<amountOfWsteth>`: Amount of shares to burn (in Shares)

#### Example

```bash
yarn start dashboard w burn 0x 0x 1
```

## Burn stETH

Burn tokens (in stETH):

```bash
yarn start dashboard w burn-steth <dashboard_address> <amountOfSteth>
```

#### Required

- `<dashboard_address>`: Dashboard address
- `<`<amountOfSteth>`>`: Amount of shares to burn (in stETH)

#### Example

```bash
yarn start dashboard w burn-steth 0x 0x 1
```

## Burn wstETH

Burn tokens (in wstETH):

```bash
yarn start dashboard w burn-wsteth <dashboard_address> <amountOfWsteth>
```

#### Required

- `<dashboard_address>`: Dashboard address
- `<amountOfWsteth>`: Amount of shares to burn (in wstETH)

#### Example

```bash
yarn start dashboard w burn-wsteth 0x 0x 1
```

## Reports

### Fetch report by Vault

```bash
yarn start report r by-vault <vault_address>
```

#### Required

- `<vault_address>`: Vault address

#### Example

```bash
yarn start report r by-vault 0x
```

### Submit by Vault

```bash
yarn start report w submit <vault_address>
```

#### Required

- `<vault_address>`: Vault address

#### Example

```bash
yarn start report w submit 0x
```

### Submit by Vaults

Submit reports for more than 1 vault:

```bash
yarn start report w by-vaults-submit <vaults...>
```

#### Required

- `<vaults...>`: Array of Vault addresses

#### Example

```bash
yarn start report w by-vaults-submit 0x 0x 0x
```

## Additional helpers

### Dashboard address by vault

```bash
yarn start dashboard r dashboard-by-vault <vault_address>
```

#### Required

- `<vault_address>`: Vault address

#### Example

```bash
yarn start dashboard r dashboard-by-vault 0x
```

### Dashboard info (constants)

Get dashboard base info:

```bash
yarn start dashboard r info <dashboard_address>
```

#### Required

- `<dashboard_address>`: Dashboard address

#### Example

```bash
yarn start dashboard r info 0x
```

### Dashboard roles

Get dashboard roles:

```bash
yarn start dashboard r roles <dashboard_address>
```

#### Required

- `<dashboard_address>`: Dashboard address

#### Example

```bash
yarn start dashboard r roles 0x
```

### Dashboard overview

Get dashboard overview:

```bash
yarn start dashboard r overview <dashboard_address>
```

#### Required

- `<dashboard_address>`: Dashboard address

#### Example

```bash
yarn start dashboard r overview 0x
```

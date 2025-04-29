---
sidebar_position: 4
---

# Mint and Burn Tokens

## Mint

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

## Burn

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

### Burn stETH

Burn tokens (in stETH):

```bash
yarn start dashboard w burn-steth <dashboard_address> <amountOfSteth>
```

#### Required

- `<dashboard_address>`: Dashboard address
- `<amountOfSteth>`: Amount of shares to burn (in stETH)

#### Example

```bash
yarn start dashboard w burn-steth 0x 0x 1
```

### Burn wstETH

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

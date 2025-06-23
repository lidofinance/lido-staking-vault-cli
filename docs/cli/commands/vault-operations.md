---
sidebar_position: 3
---

# Vault Operations

## Command

```bash
yarn start vo [arguments] [-options]
```

## Deposits commands list

```bash
yarn start vo -h
```

## API

| Command   | Description    |
| --------- | -------------- |
| read (r)  | read commands  |
| write (w) | write commands |

### Read

| Command  | Description        |
| -------- | ------------------ |
| info     | get vault info     |
| health   | get vault health   |
| overview | get vault overview |
| roles    | get vault roles    |

### Write

| Command                           | Description                                                                                                             |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| fund \<ether>                     | fund vaults                                                                                                             |
| withdraw \<eth>                   | withdraws ether from the staking vault to a recipient                                                                   |
| mint-shares mint\<amountOfShares> | mints stETH tokens backed by the vault to a recipient                                                                   |
| mint-wsteth \<amountOfWsteth>     | mints wstETH tokens backed by the vault to a recipient                                                                  |
| mint-steth \<amountOfSteth>       | mints stETH tokens backed by the vault to a recipient                                                                   |
| burn-shares burn\<amountOfShares> | Burns stETH shares from the sender backed by the vault. Expects corresponding amount of stETH approved to this contract |
| burn-steth \<amountOfShares>      | Burns stETH shares from the sender backed by the vault. Expects stETH amount approved to this contract.                 |
| create-vault                      | creates a new StakingVault and Dashboard contracts                                                                      |

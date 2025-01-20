# Liquid Staking Vault CLI

A command-line interface (CLI) tool for managing liquid staking vaults. Simplify your staking operations with intuitive commands and streamlined workflows.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
  - [Examples](#examples)
- [Contracts](#contracts)
- [License](#license)

## Features

- **Easy Setup**: Quick installation and configuration to get you started.
- **Vault Management**: Create, update, and delete staking vaults with simple commands.
- **Monitoring**: Track vault metrics.

## Prerequisites

- **Node.js**: Ensure you have Node.js (v20 or later) installed.
- **npm**: Node Package Manager is required to install dependencies.

## Installation

Install the Liquid Staking Vault CLI globally using npm:

```bash
npm install -g @lidofinance/lsv-cli
```

Alternatively, you can install it locally in your project:

```bash
npm install @lidofinance/lsv-cli
```

## Configuration

Before using the CLI, configure your environment variables. You can set them in a `.env` file in your project root.

```.env
RPC_URL_17000=
RPC_URL_1=

# Contract addresses
DEPLOYED=deployed-holesky-vaults-devnet-0.json
CONFIG=./config.json

# Wallet
PRIVATE_KEY_1=0x...
PRIVATE_KEY_17000=0x...

```
Application supported a few ways to adding or combine different settings

- 1st step
    You can pass link to json file with address of deployed contacts into **DEPLOYED** variable. If you want use
    devnet the all needed addresses of the contracts like VaultHub, VaultFactory etc already passed as example in configs/deployed-holesky-vaults-devnet-1.json.
    Also at near future this feature will be changed to resolving contracts addresses by LIDO locator and link to json
    file will no longer be necessary
- 2nd step
    You need to pass link to json config file into **CONFIG** variable. The structure of a config file has to be like
    ```javascript
    {
      "rpcLink": "https://link_to_rpc",
      "privateKey": "some_key",
      "chainId": 1, // or another number of chain id
      "lidoLocator": "LIDO locator address", // take LIDO locator address in paticular chainId
      "accounting": "LIDO accountind address" // take LIDO accounting address in paticular chainId
    }
    ```
    If you plan to manage contracts the **privateKey** is required property for this type of operations.
    For using rpcLink in a right way be attentive to match rpc resolver link and its chain ID.
    Also, You can pass rpc link as env variable into RPC_URL_(chainID)
    where chainID is current chain ID, chainId basically takes from config file, but also you can
    pass it to deployed file and process env CHAIN_ID variable.

## Usage

After installation and configuration, you can start using the CLI to manage your staking vaults.

```bash
lsv-cli [command] [options]
```

```bash
lsv-cli -h
```

### Examples

**VaultHub constants**

```bash
lsv-cli vh constants
```

**Count of all vaults**

```bash
lsv-cli vh v-count
```

## Contracts
- [VaultHub](#vaulthub)
- [VaultFactory](#vaultfactory)
- [Vault](#vault)
- [Dashboard](#dashboard)
- [Delegation](#delegation)

### VaultHub
#### Command

```bash
lsv-cli vh [arguments] [-options]
```

#### VaultHub commands list

```bash
lsv-cli vh -h
```

#### API
| Command                                                                                      | Description                                                   |
|:---------------------------------------------------------------------------------------------|:--------------------------------------------------------------|
| constants                                                                                    | get vault hub constants                                       |
| v-count                                                                                      | get connected vaults number                                   |
| vi \<index>                                                                                  | get vault and vault socket by index                           |
| va \<address>                                                                                | get vault socket by address                                   |
| v-connect \<address> \<shareLimit> \<reserveRatio> \<reserveRatioThreshold> \<treasuryFeeBP> | connects a vault to the hub (vault master role needed)        |
| v-force-rebalance \<address>                                                                 | force rebalance of the vault to have sufficient reserve ratio |
| v-role-admin \<role>                                                                         | returns the admin role that controls role                     |
| v-role-member \<role> \<index>                                                               | returns one of the accounts that have role                    |
| v-role-member-count \<role>                                                                  | returns the number of accounts that have role                 |
| v-role-has \<role> \<account>                                                                | returns true if account has been granted role                 |

### VaultFactory

#### Command

```bash
lsv-cli vf [arguments] [-options]
```

#### VaultFactory commands list

```bash
lsv-cli vf -h
```

#### API

| Command                                                | Description           |
|--------------------------------------------------------|-----------------------|
| create-vault [-option] \<managerFee> \<performanceFee> | create vault contract |

**[options]**

| Option                                       | State | Description |
|----------------------------------------------| ------------ | ------------ |
| -c, --curator \<curator>                     | required | curator address |
| -o, --operator \<operator>                   | required | operator address |
| -s, --staker \<staker>                       | required | staker address |
| -t, --token-master \<tokenMaster>            | required | token master address |
| -d, --claim-operator-due \<claimOperatorDue> | required | operator due address |
| -q, --quantity \<quantity>                   | optional | quantity of vaults to create, default 1 |

### Vault
#### Command

```bash
lsv-cli v [arguments] [-options]
```

#### Vault commands list

```bash
lsv-cli v -h
```

#### API
| Command                                                                | Description                                                                             | 
|------------------------------------------------------------------------|-----------------------------------------------------------------------------------------|
| info \<address>                                                         | get vault base info                                                                     |
| l-report \<address>                                                     | get latest vault report                                                                 |
| is-balanced \<address>                                                  | returns whether vault is balanced, i.e. its valuation is greater than the locked amount |
| operator \<address>                                                     | returns the address of the node operator                                                |
| valuation \<address>                                                    | get vault valuation                                                                     |
| unlocked \<address>                                                     | get vault unlocked                                                                      |
| locked \<address>                                                       | get vault locked                                                                        |
| withdrawal-c \<address>                                                 | get vault withdrawal credentials                                                        |
| fund \<address> \<amount>                                                | fund vault                                                                              |
| withdraw \<address> \<recipient> \<amount>                                | withdraw from vault                                                                     |
| rebalance \<address> \<amount>                                           | rebalance vault                                                                         |
| no-deposit-beacon \<address> \<numberOfDeposits> \<pubkeys> \<signatures>  | deposit to beacon chain                                                                 |
| no-val-exit \<address> \<validatorPublicKey>                             | request to exit validator                                                               |
| delta \<address>                                                        | the net difference between deposits and withdrawals                                     |

### Dashboard
#### Command

```bash
lsv-cli d [arguments] [-options]
```

#### Dashboard commands list

```bash
lsv-cli d -h
```

#### API

| Command                                            | Description                                                                  |
|----------------------------------------------------|------------------------------------------------------------------------------|
| info \<address>                                     | get dashboard base info                                                      |
| init \<address> \<vault>                             | initialize dashboard                                                         |
| vault \<address>                                    | vault info                                                                   |
| s-limit \<address>                                  | shares limit                                                                 |
| s-minted \<address>                                 | shares minted                                                                |
| reserve-ratio \<address>                            | vault reserve ratio of the vault                                             |
| t-reserve-ratio \<address>                          | threshold reserve ratio of the vault                                         |
| t-fee \<address>                                    | treasury fee basis points                                                    |
| valuation \<address>                                | valuation of the vault in ether                                              |
| t-shares \<address>                                 | total of shares that can be minted on the vault                              |
| get-shares \<address> \<ether>                       | maximum number of shares that can be minted with deposited ether             |
| get-w-eth \<address>                                | amount of ether that can be withdrawn from the staking vault                 |
| ownership \<address> \<newOwner>                     | transfers ownership of the staking vault to a new owner                      |
| disconnect \<address>                               | disconnects the staking vault from the vault hub                             |
| fund \<address> \<ether>                             | funds the staking vault with ether                                           |
| fund-weth \<address> \<wethAmount>                   | funds the staking vault with wrapped ether                                   |
| withdraw \<address> \<recipient> \<ether>             | withdraws ether from the staking vault to a recipient                        |
| withdraw-weth \<address> \<recipient> \<ether>        | withdraws stETH tokens from the staking vault to wrapped ether               |
| exit \<address> \<validatorPubKey>                   | requests the exit of a validator from the staking vault                      |
| mint \<address> \<recipient> \<amountOfShares>        | mints stETH tokens backed by the vault to a recipient                        |
| mint-wsteth \<address> \<recipient> \<tokens>         | mints wstETH tokens backed by the vault to a recipient                       |
| burn \<address> \<amountOfShares>                    | burn stETH shares from the sender backed by the vault                        |
| burn-wsteth \<address> \<tokens>                     | burn wstETH tokens from the sender backed by the vault                       |
| burn-permit \<address> \<tokens> \<permitJSON>        | burn stETH tokens from the sender backed by the vault using EIP-2612 Permit  |
| burn-wsteth-permit \<address> \<tokens> \<permitJSON> | burn wstETH tokens from the sender backed by the vault using EIP-2612 Permit |
| rebalance \<address> \<ether>                        | rebalance the vault by transferring ether                                    |

**\<permitJSON>**

```json
{
  "value": number as bigint;
  "deadline": number as bigint;
  "v": number;
  "r": string as Address;
  "s": string as Address;
}
```

### Delegation

#### Command

```bash
lsv-cli del [arguments] [-options]
```

#### Delegation commands list

```bash
lsv-cli del -h
```

#### API


| Command                                       | Description                       |
|-----------------------------------------------|-----------------------------------|
| info \<address>                               | get delegation contract base info |
| voting-info \<address>                        | get committee votes               |
| init \<address> \<vault>                       | initializes a contract            |
| cd \<address>                                 | return the accumulated curator due in ether |
| od \<address>                                 | return the accumulated operator due in ether |
| unreserved \<address>                         | returns the unreserved amount of ether |
| vc \<address>                                 | returns the committee             |
| fund \<address> \<ether>                      | funds the StakingVault with ether |
| withdraw \<address> \<recipient> \<ether>     | withdraws ether from the StakingVault |
| mint \<address> \<recipient> \<amountOfShares> | mints shares for a given recipient |
| burn \<address> \<amountOfShares>             | burns shares for a given recipient |
| rebalance \<address> \<ether>                 | rebalances the StakingVault with a given amount of ether |
| vote-lifetime \<address> \<newVoteLifetime>   | sets the vote lifetime            |
| curator-fee \<address> \<newCuratorFee>       | sets the curator fee              |
| operator-fee \<address> \<newOperatorFee>     | sets the operator fee             |
| curator-due \<address> \<curator>             | claims the curator due            |
| operator-due \<address> \<operator>           | claims the operator due           |
| t-ownership \<address> \<newOwner>             | transfers the ownership of the StakingVault |
| disconnect \<address>                          | voluntarily disconnects a StakingVault from VaultHub |

## License

This project is licensed under the [MIT License](LICENSE).

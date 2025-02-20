# Lido Staking Vault CLI

A command-line interface (CLI) tool for managing lido staking vaults. Simplify your staking operations with intuitive commands and streamlined workflows.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
  - [Examples](#examples)
- [Programs](#programs)
- [License](#license)

## Features

- **Easy Setup**: Quick installation and configuration to get you started.
- **Vault Management**: Create, update, and delete staking vaults with simple commands.
- **Monitoring**: Track vault metrics.

## Prerequisites

- **Node.js**: Ensure you have Node.js (v20 or later) installed.
- **npm**: Node Package Manager is required to install dependencies.

## Installation

Install the Lido Staking Vault CLI globally using npm:

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

- #### 1st step
  You can pass link to json file with address of deployed contacts into **DEPLOYED** variable. If you want use
  devnet the all needed addresses of the contracts like VaultHub, VaultFactory etc already passed as example in configs/deployed-holesky-vaults-devnet-1.json.
  Also at near future this feature will be changed to resolving contracts addresses by LIDO locator and link to json
  file will no longer be necessary
- #### 2nd step
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
  Also, You can pass rpc link as env variable into RPC*URL*(chainID)
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
lsv-cli hub constants
```

**Count of all vaults**

```bash
lsv-cli hub v-count
```

## Programs

- [Account](#Account)
- [VaultHub](#vaulthub)
- [VaultFactory](#vaultfactory)
- [Vault](#vault)
- [Dashboard](#dashboard)
- [Delegation](#delegation)

### Account

#### Command

```bash
lsv-cli account [arguments] [-options]
```

#### Account commands list

```bash
lsv-cli account -h
```

#### API

| Command | Description          |
| ------- | -------------------- |
| info    | general account info |

### VaultHub

#### Command

```bash
lsv-cli hub [arguments] [-options]
```

#### VaultHub commands list

```bash
lsv-cli hub -h
```

#### API

| Command                                                                                      | Description                                                                                     |
| -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| constants                                                                                    | get vault hub constants                                                                         |
| add-codehash \<codehash>                                                                     | add vault proxy codehash to allowed list                                                        |
| v-count                                                                                      | get connected vaults number                                                                     |
| vi \<index>                                                                                  | get vault and vault socket by index                                                             |
| va \<address>                                                                                | get vault socket by address                                                                     |
| v-connect \<address> \<shareLimit> \<reserveRatio> \<reserveRatioThreshold> \<treasuryFeeBP> | connects a vault to the hub (vault master role needed)                                          |
| v-force-rebalance \<address>                                                                 | force rebalance of the vault to have sufficient reserve ratio                                   |
| v-role-admin \<role>                                                                         | returns the admin role that controls role                                                       |
| v-role-member \<role> \<index>                                                               | returns one of the accounts that have role                                                      |
| v-role-member-count \<role>                                                                  | returns the number of accounts that have role                                                   |
| v-role-has \<role> \<account>                                                                | returns true if account has been granted role                                                   |
| v-update-share-limit \<address> \<shareLimit>                                                | updates share limit for the vault                                                               |
| v-disconnect \<address>                                                                      | force disconnects a vault from the hub                                                          |
| v-owner-disconnect \<address>                                                                | disconnects a vault from the hub, msg.sender should be vault's owner                            |
| v-bbv-mint \<address> \<recipient> \<amountOfShares>                                         | mint StETH shares backed by vault external balance to the receiver address                      |
| v-bbv-burn \<address> \<amountOfShares>                                                      | burn steth shares from the balance of the VaultHub contract                                     |
| v-bbv-transfer \<address> \<amountOfShares>                                                  | separate burn function for EOA vault owners; requires vaultHub to be approved to transfer stETH |

### VaultFactory

#### Command

```bash
lsv-cli factory [arguments] [-options]
```

#### VaultFactory commands list

```bash
lsv-cli factory -h
```

#### API

| Command                                                              | Description           |
| -------------------------------------------------------------------- | --------------------- |
| create-vault \[-options] \<managerFee> \<performanceFee> \[quantity] | create vault contract |

Note: \[quantity] is optional argument, default 1
**[options]**

| Option                                                 | Description                       |
| ------------------------------------------------------ | --------------------------------- |
| -a, --defaultAdmin \<defaultAdmin>                     | default admin address             |
| -f, --funder \<funder>                                 | funder role address               |
| -w, --withdrawer \<withdrawer>                         | withdrawer role address           |
| -m, --minter \<minter>                                 | minter role address               |
| -b, --burner \<burner>                                 | burner role address               |
| -r, --rebalancer \<rebalancer>                         | rebalancer role address           |
| -p, --depositPauser \<depositPauser>                   | depositPauser role address        |
| -d, --depositResumer \<depositResumer>                 | depositResumer role address       |
| -e, --exitRequester \<exitRequester>                   | exitRequester role address        |
| -u, --disconnecter \<disconnecter>                     | disconnecter role address         |
| -c, --curator \<curator>                               | curator address                   |
| -n, --nodeOperatorManager \<nodeOperatorManager>       | node operator manager address     |
| -o, --nodeOperatorFeeClaimer \<nodeOperatorFeeClaimer> | node operator fee claimer address |

### Vault

#### Command

```bash
lsv-cli vault [arguments] [-options]
```

#### Vault commands list

```bash
lsv-cli vault -h
```

#### API

| Command                                                                              | Description                                                                             |
| ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| info \<address>                                                                      | get vault base info                                                                     |
| l-report \<address>                                                                  | get latest vault report                                                                 |
| is-balanced \<address>                                                               | returns whether vault is balanced, i.e. its valuation is greater than the locked amount |
| node-operator \<address>                                                             | returns the address of the node operator                                                |
| valuation \<address>                                                                 | get vault valuation                                                                     |
| unlocked \<address>                                                                  | get vault unlocked                                                                      |
| locked \<address>                                                                    | get vault locked                                                                        |
| withdrawal-c \<address>                                                              | get vault withdrawal credentials                                                        |
| fund \<address> \<wei>                                                               | fund vault                                                                              |
| withdraw \<address> \<recipient> \<wei>                                              | withdraw from vault                                                                     |
| rebalance \<address> \<amount>                                                       | rebalance vault                                                                         |
| no-deposit-beacon \<address> \<numberOfDeposits> \<pubkeys> \<signatures>            | deposit to beacon chain                                                                 |
| no-val-exit \<address> \<validatorPublicKey>                                         | request to exit validator                                                               |
| delta \<address>                                                                     | the net difference between deposits and withdrawals                                     |
| is-paused \<address>                                                                 | Returns whether deposits are paused by the vault owner                                  |
| bc-resume \<address>                                                                 | Resumes deposits to beacon chain                                                        |
| bc-pause \<address>                                                                  | Pauses deposits to beacon chain                                                         |
| report \<address> \<valuation> \<inOutDelta> \<locked>                               | Submits a report containing valuation, inOutDelta, and locked amount                    |
| compute-deposit \<address> \<pubkey> \<withdrawalCredentials> \<signature> \<amount> | Computes the deposit data root for a validator deposit                                  |

### Dashboard

#### Command

```bash
lsv-cli dashboard [arguments] [-options]
```

#### Dashboard commands list

```bash
lsv-cli dashboard -h
```

#### API

| Command                                                    | Description                                                      |
| ---------------------------------------------------------- | ---------------------------------------------------------------- |
| info \<address>                                            | Get dashboard base info                                          |
| committee \<address>                                       | Voting committee info                                            |
| vault \<address>                                           | Vault info                                                       |
| s-limit \<address>                                         | Shares limit                                                     |
| s-minted \<address>                                        | Shares minted                                                    |
| reserve-ratio \<address>                                   | Vault reserve ratio of the vault                                 |
| t-reserve-ratio \<address>                                 | Threshold reserve ratio of the vault                             |
| t-fee \<address>                                           | Treasury fee basis points                                        |
| valuation \<address>                                       | Valuation of the vault in ether                                  |
| t-shares \<address>                                        | Total of shares that can be minted on the vault                  |
| get-shares \<address> \<ether>                             | Maximum number of shares that can be minted with deposited ether |
| withdrawable-eth \<address>                                | Amount of ether that can be withdrawn from the staking vault     |
| ownership \<address> \<newOwner>                           | Transfers ownership of the staking vault to a new owner          |
| disconnect \<address>                                      | Disconnects the staking vault from the vault hub                 |
| fund \<address> \<wei>                                     | Funds the staking vault with ether                               |
| fund-weth \<address> \<wethAmount>                         | Funds the staking vault with wrapped ether                       |
| withdraw \<address> \<recipient> \<wei>                    | Withdraws ether from the staking vault to a recipient            |
| withdraw-weth \<address> \<recipient> \<ether>             | Withdraws stETH tokens from the staking vault to wrapped ether   |
| exit \<address> \<validatorPubKey>                         | Requests the exit of a validator from the staking vault          |
| mint-shares \<address> \<recipient> \<amountOfShares>      | Mints stETH tokens backed by the vault to a recipient            |
| mint-steth \<address> \<recipient> \<amountOfShares>       | Mints stETH tokens backed by the vault to a recipient            |
| mint-wsteth \<address> \<recipient> \<tokens>              | Mints wstETH tokens backed by the vault to a recipient           |
| burn-shares \<address> \<amountOfShares>                   | Burns stETH shares from sender (requires approved stETH)         |
| burn-steth \<address> \<amountOfShares>                    | Burns stETH shares from sender (requires approved stETH)         |
| burn-wsteth \<address> \<tokens>                           | Burn wstETH tokens from sender backed by vault                   |
| burn-shares-permit \<address> \<tokens> \<permitJSON>      | Burns stETH tokens using permit (value in stETH)                 |
| burn-steth-permit \<address> \<tokens> \<permitJSON>       | Burns stETH tokens using permit                                  |
| burn-wsteth-permit \<address> \<tokens> \<permitJSON>      | Burn wstETH tokens using EIP-2612 Permit                         |
| rebalance \<address> \<ether>                              | Rebalance the vault by transferring ether                        |
| recover-erc20 \<address> \<token> \<recipient> \<amount>   | Recovers ERC20 tokens or ether from dashboard contract           |
| recover-erc721 \<address> \<token> \<tokenId> \<recipient> | Transfers ERC721 NFT by token ID                                 |
| deposit-pause \<address>                                   | Pauses beacon chain deposits on staking vault                    |
| deposit-resume \<address>                                  | Mass-grants multiple roles to multiple accounts                  |
| role-grant \<address> \<roleAssignmentJSON>                | Mass-revokes multiple roles from multiple accounts               |
| role-revoke \<address> \<roleAssignmentJSON>               | Resumes beacon chain deposits on staking vault                   |

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

**\<roleAssignmentJSON>**

```json
[{
  "account": string as Address;
  "role": string as `0x${string}`;
}]
```

### Delegation

#### Command

```bash
lsv-cli delegation [arguments] [-options]
```

#### Delegation commands list

```bash
lsv-cli delegation -h
```

#### API

| Command                                                    | Description                                                                 |
| ---------------------------------------------------------- | --------------------------------------------------------------------------- |
| roles \<address>                                           | Get delegation contract roles info                                          |
| base-info \<address>                                       | Get delegation base info                                                    |
| voting-lifetime \<address>                                 | Get committee's voting lifetime period                                      |
| is-healthy \<address>                                      | Get vault healthy info                                                      |
| voting-info \<address> \<callId> \<role>                   | Get committee votes                                                         |
| cf \<address>                                              | Curator fee in basis points                                                 |
| cf-report \<address>                                       | The last report for which curator fee was claimed. Updated on each claim    |
| cf-unclaimed \<address>                                    | Returns accumulated unclaimed curator fee in ether (U = (R \* F) / T)       |
| cf-set \<address> \<newCuratorFee>                         | Sets the curator fee                                                        |
| cf-claim \<address> \<recipient>                           | Claims the curator fee                                                      |
| nof \<address>                                             | Node operator fee in basis points                                           |
| nof-report \<address>                                      | The last report for which node operator fee was claimed. Updated on claim   |
| nof-unclaimed \<address>                                   | Returns accumulated unclaimed node operator fee in ether (U = (R \* F) / T) |
| nof-set \<address> \<newNodeOperatorFeeBP>                 | Sets the node operator fee                                                  |
| nof-claim \<address> \<recipient>                          | Claims the node operator fee                                                |
| unreserved \<address>                                      | Returns the unreserved amount of ether                                      |
| vc \<address>                                              | Returns the voting committee                                                |
| fund \<address> \<wei>                                     | Funds the StakingVault with ether                                           |
| withdraw \<address> \<recipient> \<wei>                    | Withdraws ether from the StakingVault                                       |
| mint \<address> \<recipient> \<amountOfShares>             | Mints shares for a given recipient                                          |
| burn \<address> \<amountOfShares>                          | Burns shares for a given recipient                                          |
| rebalance \<address> \<ether>                              | Rebalances the StakingVault with a given amount of ether                    |
| set-vote-lt \<address> \<newVoteLifetime>                  | Sets the vote lifetime                                                      |
| t-ownership \<address> \<newOwner>                         | Transfers the ownership of the StakingVault                                 |
| disconnect \<address>                                      | Voluntarily disconnects a StakingVault from VaultHub                        |
| deposit-pause \<address>                                   | Pauses deposits to beacon chain from the StakingVault                       |
| deposit-resume \<address>                                  | Resumes deposits to beacon chain from the StakingVault                      |
| vault \<address>                                           | Vault info                                                                  |
| s-limit \<address>                                         | Shares limit                                                                |
| s-minted \<address>                                        | Shares minted                                                               |
| reserve-ratio \<address>                                   | Vault reserve ratio of the vault                                            |
| t-reserve-ratio \<address>                                 | Threshold reserve ratio of the vault                                        |
| t-fee \<address>                                           | Treasury fee basis points                                                   |
| valuation \<address>                                       | Valuation of the vault in ether                                             |
| t-shares \<address>                                        | Total of shares that can be minted on the vault                             |
| get-shares \<address> \<ether>                             | Maximum number of shares that can be minted with deposited ether            |
| withdrawable-eth \<address>                                | Amount of ether that can be withdrawn from the staking vault                |
| ownership \<address> \<newOwner>                           | Transfers ownership of the staking vault to a new owner                     |
| fund-weth \<address> \<wethAmount>                         | Funds the staking vault with wrapped ether                                  |
| withdraw-weth \<address> \<recipient> \<ether>             | Withdraws stETH tokens from the staking vault to wrapped ether              |
| exit \<address> \<validatorPubKey>                         | Requests the exit of a validator from the staking vault                     |
| mint-shares \<address> \<recipient> \<amountOfShares>      | Mints stETH tokens backed by the vault to a recipient                       |
| mint-steth \<address> \<recipient> \<amountOfShares>       | Mints stETH tokens backed by the vault to a recipient                       |
| mint-wsteth \<address> \<recipient> \<tokens>              | Mints wstETH tokens backed by the vault to a recipient                      |
| burn-shares \<address> \<amountOfShares>                   | Burns stETH shares (requires approved stETH amount)                         |
| burn-steth \<address> \<amountOfShares>                    | Burns stETH shares (requires approved stETH amount)                         |
| burn-wsteth \<address> \<tokens>                           | Burn wstETH tokens backed by the vault                                      |
| burn-shares-permit \<address> \<tokens> \<permitJSON>      | Burns stETH tokens using permit (value in stETH)                            |
| burn-steth-permit \<address> \<tokens> \<permitJSON>       | Burns stETH tokens using permit                                             |
| burn-wsteth-permit \<address> \<tokens> \<permitJSON>      | Burn wstETH tokens using EIP-2612 Permit                                    |
| recover-erc20 \<address> \<token> \<recipient> \<amount>   | Recovers ERC20 tokens or ether from the delegation contract                 |
| recover-erc721 \<address> \<token> \<tokenId> \<recipient> | Transfers ERC721 NFT by token ID                                            |
| role-grant \<address> \<roleAssignmentJSON>                | Mass-revokes multiple roles from multiple accounts                          |
| role-revoke \<address> \<roleAssignmentJSON>               | Resumes beacon chain deposits on the staking vault                          |

## License

This project is licensed under the [MIT License](LICENSE).

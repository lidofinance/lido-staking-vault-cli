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

| Command                                                       | Description                                                     |
| ------------------------------------------------------------- | --------------------------------------------------------------- |
| constants                                                     | get vault factory constants info                                |
| BEACON \<address>                                             | Calls the read-only function "BEACON" on the contract.          |
| DELEGATION_IMPL \<address>                                    | Calls the read-only function "DELEGATION_IMPL" on the contract. |
| create-vault \<curatorFeeBP> \<nodeOperatorFeeBP> \<quantity> | create vault contract                                           |

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

| Command                                                                                   | Description                                                           |
| ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| deposit-contract \<address>                                                               | get vault deposit contract                                            |
| PUBLIC_KEY_LENGTH \<address>                                                              | Calls the read-only function "PUBLIC_KEY_LENGTH" on the contract.     |
| is-paused \<address>                                                                      | get whether deposits are paused by the vault owner                    |
| validator-w-fee \<address> \<numberOfKeys>                                                | get calculated withdrawal fee for a validator                         |
| depositor \<address>                                                                      | Calls the read-only function "depositor" on the contract.             |
| getInitializedVersion \<address>                                                          | Calls the read-only function "getInitializedVersion" on the contract. |
| delta \<address>                                                                          | get the net difference between deposits and withdrawals               |
| l-report \<address>                                                                       | get latest vault report                                               |
| locked \<address>                                                                         | get vault locked                                                      |
| no \<address>                                                                             | get vault node operator                                               |
| owner \<address>                                                                          | get vault owner                                                       |
| unlocked \<address>                                                                       | get vault unlocked                                                    |
| valuation \<address>                                                                      | get vault valuation                                                   |
| vault-hub \<address>                                                                      | get vault hub                                                         |
| version \<address>                                                                        | get vault version                                                     |
| wc \<address>                                                                             | get vault withdrawal credentials                                      |
| info \<address>                                                                           | get vault base info                                                   |
| fund                                                                                      | fund vault                                                            |
| withdraw \<address> \<recipient> \<wei>                                                   | withdraw from vault                                                   |
| no-deposit-beacon \<address> \<amountOfDeposit> \<pubkey> \<signature> \<depositDataRoot> | deposit to beacon chain                                               |
| no-val-exit \<address> \<validatorPublicKey>                                              | request to exit validator                                             |
| bc-resume \<address>                                                                      | Resumes deposits to beacon chain                                      |
| bc-pause \<address>                                                                       | Pauses deposits to beacon chain                                       |
| report \<address> \<valuation> \<inOutDelta> \<locked>                                    | Submits a report containing valuation, inOutDelta, and locked amount  |
| rebalance \<address> \<amount>                                                            | Rebalances the vault                                                  |
| trigger-v-w \<address> \<pubkeys> \<amounts> \<refundRecipient>                           | Trigger validator withdrawal                                          |

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

| Command                                                                    | Description                                                                                                             |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| ASSET_RECOVERY_ROLE \<address>                                             | Calls the read-only function "ASSET_RECOVERY_ROLE" on the contract.                                                     |
| BURN_ROLE \<address>                                                       | Calls the read-only function "BURN_ROLE" on the contract.                                                               |
| DEFAULT_ADMIN_ROLE \<address>                                              | Calls the read-only function "DEFAULT_ADMIN_ROLE" on the contract.                                                      |
| ETH \<address>                                                             | Calls the read-only function "ETH" on the contract.                                                                     |
| FUND_ROLE \<address>                                                       | Calls the read-only function "FUND_ROLE" on the contract.                                                               |
| MAX_CONFIRM_EXPIRY \<address>                                              | Calls the read-only function "MAX_CONFIRM_EXPIRY" on the contract.                                                      |
| MINT_ROLE \<address>                                                       | Calls the read-only function "MINT_ROLE" on the contract.                                                               |
| MIN_CONFIRM_EXPIRY \<address>                                              | Calls the read-only function "MIN_CONFIRM_EXPIRY" on the contract.                                                      |
| PAUSE_BEACON_CHAIN_DEPOSITS_ROLE \<address>                                | Calls the read-only function "PAUSE_BEACON_CHAIN_DEPOSITS_ROLE" on the contract.                                        |
| PDG_WITHDRAWAL_ROLE \<address>                                             | Calls the read-only function "PDG_WITHDRAWAL_ROLE" on the contract.                                                     |
| REBALANCE_ROLE \<address>                                                  | Calls the read-only function "REBALANCE_ROLE" on the contract.                                                          |
| REQUEST_VALIDATOR_EXIT_ROLE \<address>                                     | Calls the read-only function "REQUEST_VALIDATOR_EXIT_ROLE" on the contract.                                             |
| RESUME_BEACON_CHAIN_DEPOSITS_ROLE \<address>                               | Calls the read-only function "RESUME_BEACON_CHAIN_DEPOSITS_ROLE" on the contract.                                       |
| STETH \<address>                                                           | Calls the read-only function "STETH" on the contract.                                                                   |
| TRIGGER_VALIDATOR_WITHDRAWAL_ROLE \<address>                               | Calls the read-only function "TRIGGER_VALIDATOR_WITHDRAWAL_ROLE" on the contract.                                       |
| VOLUNTARY_DISCONNECT_ROLE \<address>                                       | Calls the read-only function "VOLUNTARY_DISCONNECT_ROLE" on the contract.                                               |
| WETH \<address>                                                            | Calls the read-only function "WETH" on the contract.                                                                    |
| WITHDRAW_ROLE \<address>                                                   | Calls the read-only function "WITHDRAW_ROLE" on the contract.                                                           |
| WSTETH \<address>                                                          | Calls the read-only function "WSTETH" on the contract.                                                                  |
| confirmations \<address> \<callData> \<role>                               | Calls the read-only function "confirmations" on the contract.                                                           |
| confirmingRoles \<address>                                                 | Calls the read-only function "confirmingRoles" on the contract.                                                         |
| getConfirmExpiry \<address>                                                | Calls the read-only function "getConfirmExpiry" on the contract.                                                        |
| getRoleAdmin \<address> \<role>                                            | Calls the read-only function "getRoleAdmin" on the contract.                                                            |
| getRoleMember \<address> \<role> \<index>                                  | Calls the read-only function "getRoleMember" on the contract.                                                           |
| getRoleMemberCount \<address> \<role>                                      | Calls the read-only function "getRoleMemberCount" on the contract.                                                      |
| getRoleMembers \<address> \<role>                                          | Calls the read-only function "getRoleMembers" on the contract.                                                          |
| has-role \<address> \<role> \<account>                                     | get has role by role and account                                                                                        |
| initialized \<address>                                                     | Calls the read-only function "initialized" on the contract.                                                             |
| projected-new-mintable-shares \<address> \<etherToFund>                    | get projected new mintable shares                                                                                       |
| r-threshold \<address>                                                     | get rebalance threshold in basis points                                                                                 |
| reserve-ratio \<address>                                                   | get reserve ratio in basis points                                                                                       |
| s-limit \<address>                                                         | get share limit                                                                                                         |
| s-minted \<address>                                                        | get shares minted                                                                                                       |
| vault \<address>                                                           | get staking vault address                                                                                               |
| supports-interface \<address> \<interfaceId>                               | get supports interface by id                                                                                            |
| total-mintable-shares \<address>                                           | get total of shares that can be minted on the vault                                                                     |
| t-fee \<address>                                                           | get treasury fee in basis points                                                                                        |
| valuation \<address>                                                       | get vault valuation                                                                                                     |
| hub \<address>                                                             | get vaultHub address                                                                                                    |
| socket \<address>                                                          | get vault socket                                                                                                        |
| w-ether \<address>                                                         | get amount of ether that can be withdrawn from the staking vault                                                        |
| info                                                                       | get dashboard base info                                                                                                 |
| ownership \<address> \<newOwner>                                           | transfers ownership of the staking vault to a new owner                                                                 |
| disconnect \<address>                                                      | disconnects the staking vault from the vault hub                                                                        |
| fund                                                                       | funds the staking vault with ether                                                                                      |
| fund-weth \<address> \<wethAmount>                                         | funds the staking vault with wrapped ether                                                                              |
| withdraw \<address> \<recipient> \<wei>                                    | withdraws ether from the staking vault to a recipient                                                                   |
| withdraw-weth \<address> \<recipient> \<ether>                             | withdraws stETH tokens from the staking vault to wrapped ether                                                          |
| exit \<address> \<validatorPubKey>                                         | requests the exit of a validator from the staking vault                                                                 |
| trigger-validator-withdrawal \<address> \<pubkeys> \<amounts> \<recipient> | triggers the withdrawal of a validator from the staking vault                                                           |
| mint-shares \<address> \<recipient> \<amountOfShares>                      | mints stETH tokens backed by the vault to a recipient                                                                   |
| mint-steth \<address> \<recipient> \<amountOfShares>                       | mints stETH tokens backed by the vault to a recipient                                                                   |
| mint-wsteth \<address> \<recipient> \<tokens>                              | mints wstETH tokens backed by the vault to a recipient                                                                  |
| burn-shares \<address> \<amountOfShares>                                   | Burns stETH shares from the sender backed by the vault. Expects corresponding amount of stETH approved to this contract |
| burn-steth \<address> \<amountOfShares>                                    | Burns stETH shares from the sender backed by the vault. Expects stETH amount approved to this contract.                 |
| burn-wsteth \<address> \<tokens>                                           | burn wstETH tokens from the sender backed by the vault                                                                  |
| burn-shares-permit \<address> \<tokens> \<permitJSON>                      | Burns stETH tokens (in shares) backed by the vault from the sender using permit (with value in stETH).                  |
| burn-steth-permit \<address> \<tokens> \<permitJSON>                       | Burns stETH tokens backed by the vault from the sender using permit.                                                    |
| burn-wsteth-permit \<address> \<tokens> \<permitJSON>                      | burn wstETH tokens from the sender backed by the vault using EIP-2612 Permit                                            |
| rebalance \<address> \<ether>                                              | rebalance the vault by transferring ether                                                                               |
| recover-erc20 \<address> \<token> \<recipient> \<amount>                   | recovers ERC20 tokens or ether from the dashboard contract to sender                                                    |
| recover-erc721 \<address> \<token> \<tokenId> \<recipient>                 | Transfers a given token_id of an ERC721-compatible NFT (defined by the token contract address)                          |
| deposit-pause \<address>                                                   | Pauses beacon chain deposits on the staking vault.                                                                      |
| deposit-resume \<address>                                                  | Mass-grants multiple roles to multiple accounts.                                                                        |
| role-grant \<address> \<roleAssignmentJSON>                                | Mass-revokes multiple roles from multiple accounts.                                                                     |
| role-revoke \<address> \<roleAssignmentJSON>                               | Resumes beacon chain deposits on the staking vault.                                                                     |
| compensate-disproven-predeposit \<address> \<pubkey> \<recipient>          | Compensates a disproven predeposit from the Predeposit Guarantee contract.                                              |

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

| Command                                                    | Description                                                                                                             |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| ASSET_RECOVERY_ROLE \<address>                             | Calls the read-only function "ASSET_RECOVERY_ROLE" on the contract.                                                     |
| BURN_ROLE \<address>                                       | Calls the read-only function "BURN_ROLE" on the contract.                                                               |
| CURATOR_FEE_CLAIM_ROLE \<address>                          | Calls the read-only function "CURATOR_FEE_CLAIM_ROLE" on the contract.                                                  |
| CURATOR_FEE_SET_ROLE \<address>                            | Calls the read-only function "CURATOR_FEE_SET_ROLE" on the contract.                                                    |
| DEFAULT_ADMIN_ROLE \<address>                              | Calls the read-only function "DEFAULT_ADMIN_ROLE" on the contract.                                                      |
| ETH \<address>                                             | Calls the read-only function "ETH" on the contract.                                                                     |
| FUND_ROLE \<address>                                       | Calls the read-only function "FUND_ROLE" on the contract.                                                               |
| MAX_CONFIRM_EXPIRY \<address>                              | Calls the read-only function "MAX_CONFIRM_EXPIRY" on the contract.                                                      |
| MINT_ROLE \<address>                                       | Calls the read-only function "MINT_ROLE" on the contract.                                                               |
| MIN_CONFIRM_EXPIRY \<address>                              | Calls the read-only function "MIN_CONFIRM_EXPIRY" on the contract.                                                      |
| NODE_OPERATOR_FEE_CLAIM_ROLE \<address>                    | Calls the read-only function "NODE_OPERATOR_FEE_CLAIM_ROLE" on the contract.                                            |
| NODE_OPERATOR_MANAGER_ROLE \<address>                      | Calls the read-only function "NODE_OPERATOR_MANAGER_ROLE" on the contract.                                              |
| PAUSE_BEACON_CHAIN_DEPOSITS_ROLE \<address>                | Calls the read-only function "PAUSE_BEACON_CHAIN_DEPOSITS_ROLE" on the contract.                                        |
| PDG_WITHDRAWAL_ROLE \<address>                             | Calls the read-only function "PDG_WITHDRAWAL_ROLE" on the contract.                                                     |
| REBALANCE_ROLE \<address>                                  | Calls the read-only function "REBALANCE_ROLE" on the contract.                                                          |
| REQUEST_VALIDATOR_EXIT_ROLE \<address>                     | Calls the read-only function "REQUEST_VALIDATOR_EXIT_ROLE" on the contract.                                             |
| RESUME_BEACON_CHAIN_DEPOSITS_ROLE \<address>               | Calls the read-only function "RESUME_BEACON_CHAIN_DEPOSITS_ROLE" on the contract.                                       |
| STETH \<address>                                           | Calls the read-only function "STETH" on the contract.                                                                   |
| TRIGGER_VALIDATOR_WITHDRAWAL_ROLE \<address>               | Calls the read-only function "TRIGGER_VALIDATOR_WITHDRAWAL_ROLE" on the contract.                                       |
| VOLUNTARY_DISCONNECT_ROLE \<address>                       | Calls the read-only function "VOLUNTARY_DISCONNECT_ROLE" on the contract.                                               |
| WETH \<address>                                            | Calls the read-only function "WETH" on the contract.                                                                    |
| WITHDRAW_ROLE \<address>                                   | Calls the read-only function "WITHDRAW_ROLE" on the contract.                                                           |
| WSTETH \<address>                                          | Calls the read-only function "WSTETH" on the contract.                                                                  |
| confirmations \<address> \<callData> \<role>               | Calls the read-only function "confirmations" on the contract.                                                           |
| confirmingRoles \<address>                                 | Calls the read-only function "confirmingRoles" on the contract.                                                         |
| curatorFeeBP \<address>                                    | Calls the read-only function "curatorFeeBP" on the contract.                                                            |
| curatorFeeClaimedReport \<address>                         | Calls the read-only function "curatorFeeClaimedReport" on the contract.                                                 |
| cf-unclaimed \<address>                                    | Returns the accumulated unclaimed curator fee in ether                                                                  |
| getConfirmExpiry \<address>                                | Calls the read-only function "getConfirmExpiry" on the contract.                                                        |
| getRoleAdmin \<address> \<role>                            | Calls the read-only function "getRoleAdmin" on the contract.                                                            |
| getRoleMember \<address> \<role> \<index>                  | Calls the read-only function "getRoleMember" on the contract.                                                           |
| getRoleMemberCount \<address> \<role>                      | Calls the read-only function "getRoleMemberCount" on the contract.                                                      |
| getRoleMembers \<address> \<role>                          | Calls the read-only function "getRoleMembers" on the contract.                                                          |
| has-role \<address> \<role> \<account>                     | get has role by role and account                                                                                        |
| initialized \<address>                                     | Calls the read-only function "initialized" on the contract.                                                             |
| no-fee \<address>                                          | get node operator fee in basis points                                                                                   |
| no-fee-report \<address>                                   | get node operator fee claimed report                                                                                    |
| no-unclaimed-fee \<address>                                | Returns the accumulated unclaimed node operator fee in ether                                                            |
| projected-new-mintable-shares \<address> \<etherToFund>    | get projected new mintable shares                                                                                       |
| r-threshold \<address>                                     | get rebalance threshold in basis points                                                                                 |
| reserve-ratio \<address>                                   | get reserve ratio in basis points                                                                                       |
| s-limit \<address>                                         | get share limit                                                                                                         |
| s-minted \<address>                                        | get shares minted                                                                                                       |
| vault \<address>                                           | get staking vault address                                                                                               |
| supports-interface \<address> \<interfaceId>               | get supports interface by id                                                                                            |
| total-mintable-shares \<address>                           | get total of shares that can be minted on the vault                                                                     |
| t-fee \<address>                                           | get treasury fee in basis points                                                                                        |
| unreserved \<address>                                      | Calls the read-only function "unreserved" on the contract.                                                              |
| valuation \<address>                                       | get vault valuation                                                                                                     |
| hub \<address>                                             | get vaultHub address                                                                                                    |
| socket \<address>                                          | get vault socket                                                                                                        |
| w-ether \<address>                                         | get amount of ether that can be withdrawn from the staking vault                                                        |
| roles \<address>                                           | get delegation contract roles info                                                                                      |
| base-info \<address>                                       | get delegation base info                                                                                                |
| is-healthy \<address>                                      | get vault healthy info                                                                                                  |
| cf-set \<address> \<newCuratorFee>                         | sets the curator fee                                                                                                    |
| cf-claim \<address> \<recipient>                           | claims the curator fee                                                                                                  |
| nof-set \<address> \<newNodeOperatorFeeBP>                 | sets the node operator fee                                                                                              |
| nof-claim \<address> \<recipient>                          | claims the node operator fee                                                                                            |
| fund \<address> \<wei>                                     | funds the StakingVault with ether                                                                                       |
| withdraw \<address> \<recipient> \<wei>                    | withdraws ether from the StakingVault                                                                                   |
| rebalance \<address> \<ether>                              | rebalances the StakingVault with a given amount of ether                                                                |
| t-ownership \<address> \<newOwner>                         | transfers the ownership of the StakingVault                                                                             |
| disconnect \<address>                                      | voluntarily disconnects a StakingVault from VaultHub                                                                    |
| deposit-pause \<address>                                   | Pauses deposits to beacon chain from the StakingVault.                                                                  |
| deposit-resume \<address>                                  | Resumes deposits to beacon chain from the StakingVault.                                                                 |
| fund-weth \<address> \<wethAmount>                         | funds the staking vault with wrapped ether                                                                              |
| withdraw-weth \<address> \<recipient> \<ether>             | withdraws stETH tokens from the staking vault to wrapped ether                                                          |
| exit \<address> \<validatorPubKey>                         | requests the exit of a validator from the staking vault                                                                 |
| mint-shares \<address> \<recipient> \<amountOfShares>      | mints stETH tokens backed by the vault to a recipient                                                                   |
| mint-steth \<address> \<recipient> \<amountOfShares>       | mints stETH tokens backed by the vault to a recipient                                                                   |
| mint-wsteth \<address> \<recipient> \<tokens>              | mints wstETH tokens backed by the vault to a recipient                                                                  |
| burn-shares \<address> \<amountOfShares>                   | Burns stETH shares from the sender backed by the vault. Expects corresponding amount of stETH approved to this contract |
| burn-steth \<address> \<amountOfShares>                    | Burns stETH shares from the sender backed by the vault. Expects stETH amount approved to this contract.                 |
| burn-wsteth \<address> \<tokens>                           | burn wstETH tokens from the sender backed by the vault                                                                  |
| burn-shares-permit \<address> \<tokens> \<permitJSON>      | Burns stETH tokens (in shares) backed by the vault from the sender using permit (with value in stETH).                  |
| burn-steth-permit \<address> \<tokens> \<permitJSON>       | Burns stETH tokens backed by the vault from the sender using permit.                                                    |
| burn-wsteth-permit \<address> \<tokens> \<permitJSON>      | burn wstETH tokens from the sender backed by the vault using EIP-2612 Permit                                            |
| recover-erc20 \<address> \<token> \<recipient> \<amount>   | recovers ERC20 tokens or ether from the delegation contract to sender                                                   |
| recover-erc721 \<address> \<token> \<tokenId> \<recipient> | Transfers a given token_id of an ERC721-compatible NFT (defined by the token contract address)                          |
| role-grant \<address> \<roleAssignmentJSON>                | Mass-revokes multiple roles from multiple accounts.                                                                     |
| role-revoke \<address> \<roleAssignmentJSON>               | Resumes beacon chain deposits on the staking vault.                                                                     |
| set-confirm-expiry \<address> \<newConfirmExpiry>          | set the confirmation expiry                                                                                             |

## License

This project is licensed under the [MIT License](LICENSE).

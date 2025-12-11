---
sidebar_position: 4
---

# StvStethPool

## Command

```bash
yarn start defi-wrapper contracts stv-steth [arguments] [-options]
```

## StvStethPool commands list

```bash
yarn start defi-wrapper contracts stv-steth -h
```

## API

| Command   | Description    |
| --------- | -------------- |
| read (r)  | read commands  |
| write (w) | write commands |

### Read

| Command                                                                 | Description                                                                        |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| info \<address>                                                         | get stv pool base info                                                             |
| ALLOW_LIST_ENABLED \<address>                                           | Calls the read-only function "ALLOW_LIST_ENABLED" on the contract.                 |
| ALLOW_LIST_MANAGER_ROLE \<address>                                      | Calls the read-only function "ALLOW_LIST_MANAGER_ROLE" on the contract.            |
| DASHBOARD \<address>                                                    | Calls the read-only function "DASHBOARD" on the contract.                          |
| DEFAULT_ADMIN_ROLE \<address>                                           | Calls the read-only function "DEFAULT_ADMIN_ROLE" on the contract.                 |
| DEPOSITS_FEATURE \<address>                                             | Calls the read-only function "DEPOSITS_FEATURE" on the contract.                   |
| DEPOSITS_PAUSE_ROLE \<address>                                          | Calls the read-only function "DEPOSITS_PAUSE_ROLE" on the contract.                |
| DEPOSITS_RESUME_ROLE \<address>                                         | Calls the read-only function "DEPOSITS_RESUME_ROLE" on the contract.               |
| DEPOSIT_ROLE \<address>                                                 | Calls the read-only function "DEPOSIT_ROLE" on the contract.                       |
| DISTRIBUTOR \<address>                                                  | Calls the read-only function "DISTRIBUTOR" on the contract.                        |
| LOSS_SOCIALIZER_ROLE \<address>                                         | Calls the read-only function "LOSS_SOCIALIZER_ROLE" on the contract.               |
| MINTING_FEATURE \<address>                                              | Calls the read-only function "MINTING_FEATURE" on the contract.                    |
| MINTING_PAUSE_ROLE \<address>                                           | Calls the read-only function "MINTING_PAUSE_ROLE" on the contract.                 |
| MINTING_RESUME_ROLE \<address>                                          | Calls the read-only function "MINTING_RESUME_ROLE" on the contract.                |
| RESERVE_RATIO_GAP_BP \<address>                                         | Calls the read-only function "RESERVE_RATIO_GAP_BP" on the contract.               |
| STETH \<address>                                                        | Calls the read-only function "STETH" on the contract.                              |
| TOTAL_BASIS_POINTS \<address>                                           | Calls the read-only function "TOTAL_BASIS_POINTS" on the contract.                 |
| VAULT \<address>                                                        | Calls the read-only function "VAULT" on the contract.                              |
| VAULT_HUB \<address>                                                    | Calls the read-only function "VAULT_HUB" on the contract.                          |
| WITHDRAWAL_QUEUE \<address>                                             | Calls the read-only function "WITHDRAWAL_QUEUE" on the contract.                   |
| WSTETH \<address>                                                       | Calls the read-only function "WSTETH" on the contract.                             |
| allowance \<address> \<owner> \<spender>                                | Calls the read-only function "allowance" on the contract.                          |
| assetsOf \<address> \<\_account>                                        | Calls the read-only function "assetsOf" on the contract.                           |
| balanceOf \<address> \<account>                                         | Calls the read-only function "balanceOf" on the contract.                          |
| calc-assets-to-lock-for-steth-shares \<address> \<stethShares>          | get calculated the min amount of assets to lock for a given amount of stETH shares |
| calc-steth-shares-to-mint-for-assets \<address> \<assets>               | get calculated the amount of stETH shares to mint for a given amount of assets     |
| calc-steth-shares-to-mint-for-stv \<address> \<stv>                     | get calculated amount of stETH shares to mint for a given amount of stv            |
| calc-stv-to-lock-for-steth-shares \<address> \<stethShares>             | get calculated min amount of stv to lock for a given amount of stETH shares        |
| decimals \<address>                                                     | Calls the read-only function "decimals" on the contract.                           |
| forcedRebalanceThresholdBP \<address>                                   | Calls the read-only function "forcedRebalanceThresholdBP" on the contract.         |
| getAllowListAddresses \<address>                                        | Calls the read-only function "getAllowListAddresses" on the contract.              |
| getAllowListSize \<address>                                             | Calls the read-only function "getAllowListSize" on the contract.                   |
| getRoleAdmin \<address> \<role>                                         | Calls the read-only function "getRoleAdmin" on the contract.                       |
| getRoleMember \<address> \<role> \<index>                               | Calls the read-only function "getRoleMember" on the contract.                      |
| getRoleMemberCount \<address> \<role>                                   | Calls the read-only function "getRoleMemberCount" on the contract.                 |
| getRoleMembers \<address> \<role>                                       | Calls the read-only function "getRoleMembers" on the contract.                     |
| hasRole \<address> \<role> \<account>                                   | Calls the read-only function "hasRole" on the contract.                            |
| isAllowListed \<address> \<\_user>                                      | Calls the read-only function "isAllowListed" on the contract.                      |
| isFeaturePaused \<address> \<\_featureId>                               | Calls the read-only function "isFeaturePaused" on the contract.                    |
| isHealthyOf \<address> \<\_account>                                     | Calls the read-only function "isHealthyOf" on the contract.                        |
| maxLossSocializationBP \<address>                                       | Calls the read-only function "maxLossSocializationBP" on the contract.             |
| minted-steth-shares-of \<address> \<account>                            | get the amount of stETH shares minted by the pool for a specific account           |
| name \<address>                                                         | Calls the read-only function "name" on the contract.                               |
| nominalAssetsOf \<address> \<\_account>                                 | Calls the read-only function "nominalAssetsOf" on the contract.                    |
| poolType \<address>                                                     | Calls the read-only function "poolType" on the contract.                           |
| preview-deposit \<address> \<assets>                                    | get preview the amount of stv that would be received for a given asset amount      |
| previewForceRebalance \<address> \<\_account>                           | Calls the read-only function "previewForceRebalance" on the contract.              |
| preview-redeem \<address> \<stv>                                        | get preview the amount of assets that would be received for a given stv amount     |
| preview-withdraw \<address> \<assets>                                   | get preview the amount of stv that would be burned for a given asset withdrawal    |
| remainingMintingCapacitySharesOf \<address> \<\_account> \<\_ethToFund> | Calls the read-only function "remainingMintingCapacitySharesOf" on the contract.   |
| reserveRatioBP \<address>                                               | Calls the read-only function "reserveRatioBP" on the contract.                     |
| stethSharesToBurnForStvOf \<address> \<\_account> \<\_stv>              | Calls the read-only function "stethSharesToBurnForStvOf" on the contract.          |
| supportsInterface \<address> \<interfaceId>                             | Calls the read-only function "supportsInterface" on the contract.                  |
| symbol \<address>                                                       | Calls the read-only function "symbol" on the contract.                             |
| total-assets ta\<address>                                               | get the total assets managed by the pool                                           |
| total-exceeding-minted-steth tems\<address>                             | get the amount of minted stETH exceeding the Staking Vault's liability             |
| total-exceeding-minted-steth-shares \<address>                          | get the amount of minted stETH shares exceeding the Staking Vault's liability      |
| total-liability-shares tls\<address>                                    | get the total liability stETH shares issued to the vault                           |
| total-minted-steth-shares \<address>                                    | get the total stETH shares minted by the pool                                      |
| totalMintingCapacitySharesOf \<address> \<\_account>                    | Calls the read-only function "totalMintingCapacitySharesOf" on the contract.       |
| totalNominalAssets \<address>                                           | Calls the read-only function "totalNominalAssets" on the contract.                 |
| totalSupply \<address>                                                  | Calls the read-only function "totalSupply" on the contract.                        |
| total-unassigned-liability-shares tuls\<address>                        | get the total liability stETH shares that are not assigned to any users            |
| totalUnassignedLiabilitySteth \<address>                                | Calls the read-only function "totalUnassignedLiabilitySteth" on the contract.      |
| unlockedAssetsOf \<address> \<\_account> \<\_stethSharesToBurn>         | Calls the read-only function "unlockedAssetsOf" on the contract.                   |
| unlockedAssetsOf_account \<address> \<\_account>                        | Calls the read-only function "unlockedAssetsOf" on the contract.                   |
| unlockedStvOf \<address> \<\_account>                                   | Calls the read-only function "unlockedStvOf" on the contract.                      |
| unlockedStvOf_account \<address> \<\_account> \<\_stethSharesToBurn>    | Calls the read-only function "unlockedStvOf" on the contract.                      |

### Write

| Command                                                        | Description                                                                   |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| deposit-eth-shares \<address> \<referral> \<stethSharesToMint> | deposit native ETH and receive stv, minting a specific amount of stETH shares |
| deposit-eth-wsteth \<address> \<referral> \<stethSharesToMint> | deposit native ETH and receive stv, minting a specific amount of stETH shares |
| rebalance-unassigned-liability \<address> \<stethShares>       | rebalance unassigned liability by repaying it with assets held by the vault   |
| rebalance-unassigned-liability-with-ether \<address> \<ether>  | rebalance unassigned liability by repaying it with external ether             |
| add-to-allow-list \<address> \<user>                           | add an address to the allowlist                                               |
| remove-from-allow-list \<address> \<user>                      | remove an address from the allowlist                                          |
| mint-steth-shares \<address> \<stethShares>                    | mint stETH shares up to the user's minting capacity                           |
| burn-steth-shares \<address> \<stethShares>                    | burn stETH shares to reduce the user's minted stETH obligation                |
| transfer-with-liability \<address> \<to> \<stv> \<stethShares> | transfer stETH shares with liability to another address                       |

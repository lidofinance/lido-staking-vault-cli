---
sidebar_position: 1
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

| Command                                                          | Description                                                                                   |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| info \<address>                                                  | get stv pool base info                                                                        |
| ALLOW_LIST_ENABLED \<address>                                    | Calls the read-only function "ALLOW_LIST_ENABLED" on the contract.                            |
| ALLOW_LIST_MANAGER_ROLE \<address>                               | Calls the read-only function "ALLOW_LIST_MANAGER_ROLE" on the contract.                       |
| ASSET_DECIMALS \<address>                                        | Calls the read-only function "ASSET_DECIMALS" on the contract.                                |
| DASHBOARD \<address>                                             | Calls the read-only function "DASHBOARD" on the contract.                                     |
| DECIMALS \<address>                                              | Calls the read-only function "DECIMALS" on the contract.                                      |
| DEFAULT_ADMIN_ROLE \<address>                                    | Calls the read-only function "DEFAULT_ADMIN_ROLE" on the contract.                            |
| DEPOSIT_ROLE \<address>                                          | Calls the read-only function "DEPOSIT_ROLE" on the contract.                                  |
| EXTRA_DECIMALS_BASE \<address>                                   | Calls the read-only function "EXTRA_DECIMALS_BASE" on the contract.                           |
| MAX_MINTABLE_AMOUNT \<address>                                   | Calls the read-only function "MAX_MINTABLE_AMOUNT" on the contract.                           |
| REQUEST_VALIDATOR_EXIT_ROLE \<address>                           | Calls the read-only function "REQUEST_VALIDATOR_EXIT_ROLE" on the contract.                   |
| STAKING_VAULT \<address>                                         | Calls the read-only function "STAKING_VAULT" on the contract.                                 |
| STETH \<address>                                                 | Calls the read-only function "STETH" on the contract.                                         |
| TOTAL_BASIS_POINTS \<address>                                    | Calls the read-only function "TOTAL_BASIS_POINTS" on the contract.                            |
| TRIGGER_VALIDATOR_WITHDRAWAL_ROLE \<address>                     | Calls the read-only function "TRIGGER_VALIDATOR_WITHDRAWAL_ROLE" on the contract.             |
| VAULT_HUB \<address>                                             | Calls the read-only function "VAULT_HUB" on the contract.                                     |
| WITHDRAWAL_QUEUE \<address>                                      | Calls the read-only function "WITHDRAWAL_QUEUE" on the contract.                              |
| WRAPPER_RR_BP \<address>                                         | Calls the read-only function "WRAPPER_RR_BP" on the contract.                                 |
| allowance \<address> \<owner> \<spender>                         | Calls the read-only function "allowance" on the contract.                                     |
| assetsOf \<address> \<\_account>                                 | Calls the read-only function "assetsOf" on the contract.                                      |
| balanceOf \<address> \<account>                                  | Calls the read-only function "balanceOf" on the contract.                                     |
| calc-assets-to-lock-for-steth-shares \<address> \<stethShares>   | get calculated the min amount of assets to lock for a given amount of stETH shares            |
| calc-steth-shares-to-mint-for-assets \<address> \<assets>        | get calculated the amount of stETH shares to mint for a given amount of assets                |
| calc-steth-shares-to-mint-for-stv \<address> \<stv>              | get calculated amount of stETH shares to mint for a given amount of stv                       |
| calc-stv-to-lock-for-steth-shares \<address> \<stethShares>      | get calculated min amount of stv to lock for a given amount of stETH shares                   |
| decimals \<address>                                              | Calls the read-only function "decimals" on the contract.                                      |
| exceeding-minted-steth-of \<address> \<account>                  | get the amount of stETH exceeding the Staking Vault's liability for a specific account        |
| exceeding-minted-steth-shares-of \<address> \<account>           | get the amount of stETH shares exceeding the Staking Vault's liability for a specific account |
| getAllowListAddresses \<address>                                 | Calls the read-only function "getAllowListAddresses" on the contract.                         |
| getAllowListSize \<address>                                      | Calls the read-only function "getAllowListSize" on the contract.                              |
| getRoleAdmin \<address> \<role>                                  | Calls the read-only function "getRoleAdmin" on the contract.                                  |
| getRoleMember \<address> \<role> \<index>                        | Calls the read-only function "getRoleMember" on the contract.                                 |
| getRoleMemberCount \<address> \<role>                            | Calls the read-only function "getRoleMemberCount" on the contract.                            |
| getRoleMembers \<address> \<role>                                | Calls the read-only function "getRoleMembers" on the contract.                                |
| hasRole \<address> \<role> \<account>                            | Calls the read-only function "hasRole" on the contract.                                       |
| isAllowListed \<address> \<\_user>                               | Calls the read-only function "isAllowListed" on the contract.                                 |
| minted-steth-shares-of \<address> \<account>                     | get the amount of stETH shares minted by the pool for a specific account                      |
| minting-capacity-shares-of \<address> \<account>                 | get the calculated minting capacity in stETH shares for a specific account                    |
| name \<address>                                                  | Calls the read-only function "name" on the contract.                                          |
| nominalAssetsOf \<address> \<\_account>                          | Calls the read-only function "nominalAssetsOf" on the contract.                               |
| preview-deposit \<address> \<assets>                             | get preview the amount of stv that would be received for a given asset amount                 |
| preview-redeem \<address> \<stv>                                 | get preview the amount of assets that would be received for a given stv amount                |
| preview-withdraw \<address> \<assets>                            | get preview the amount of stv that would be burned for a given asset withdrawal               |
| remaining-minting-capacity-shares \<address> \<ethToFund>        | get the remaining Staking Vault minting capacity in stETH shares                              |
| steth-shares-for-withdrawal \<address> \<account> \<stv>         | get the calculated amount of stETH shares required for a given amount of stv to withdraw      |
| supportsInterface \<address> \<interfaceId>                      | Calls the read-only function "supportsInterface" on the contract.                             |
| symbol \<address>                                                | Calls the read-only function "symbol" on the contract.                                        |
| total-assets ta\<address>                                        | get the total assets managed by the pool                                                      |
| total-exceeding-minted-steth tems\<address>                      | get the amount of minted stETH exceeding the Staking Vault's liability                        |
| totalExceedingMintedStethShares \<address>                       | Calls the read-only function "totalExceedingMintedStethShares" on the contract.               |
| total-liability-shares tls\<address>                             | get the total liability stETH shares issued to the vault                                      |
| total-minted-steth-shares \<address>                             | get the total stETH shares minted by the pool                                                 |
| total-minting-capacity-shares \<address>                         | get the total Staking Vault minting capacity in stETH shares                                  |
| totalNominalAssets \<address>                                    | Calls the read-only function "totalNominalAssets" on the contract.                            |
| totalSupply \<address>                                           | Calls the read-only function "totalSupply" on the contract.                                   |
| total-unassigned-liability-shares tuls\<address>                 | get the total liability stETH shares that are not assigned to any users                       |
| vault-disconnected \<address>                                    | get whether the vault is disconnected                                                         |
| withdrawable-eth-of \<address> \<account> \<\_stethSharesToBurn> | get calculated the amount of ETH that can be withdrawn by an account                          |
| withdrawableEthOf_account \<address> \<account>                  | get calculated the amount of ETH that can be withdrawn by an account                          |
| withdrawable-stv-of \<address> \<account> \<\_stethSharesToBurn> | get calculated amount of stv that can be withdrawn by an account                              |
| withdrawableStvOf_account \<address> \<account>                  | get calculated amount of stv that can be withdrawn by an account                              |
| withdrawalQueue \<address>                                       | Calls the read-only function "withdrawalQueue" on the contract.                               |
| wrapperType \<address>                                           | Calls the read-only function "wrapperType" on the contract.                                   |

### Write

| Command                                                                                        | Description                                                                 |
| ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| deposit-eth \<address> \<referral> \<receiver> \<stethSharesToMint>                            | convenience function to deposit ETH to msg.sender                           |
| rebalance-unassigned-liability \<address> \<stethShares>                                       | rebalance unassigned liability by repaying it with assets held by the vault |
| rebalance-unassigned-liability-with-ether \<address> \<ether>                                  | rebalance unassigned liability by repaying it with external ether           |
| request-withdrawal-eth \<address> \<assetsToWithdraw>                                          | request a withdrawal by specifying the amount of assets to withdraw         |
| request-withdrawal \<address> \<stvToWithdraw> \<stethSharesToBurn> \<stethSharesToRebalance>  | request a withdrawal by specifying the amount of stv to withdraw            |
| request-withdrawals \<address> \<stvToWithdraw> \<stethSharesToBurn> \<stethSharesToRebalance> | request multiple withdrawals by specifying the amounts of stv to withdraw   |
| claim-withdrawal \<address> \<requestId>                                                       | claim finalized withdrawal request                                          |
| claim-withdrawals \<address> \<requestIds> \<hints>                                            | claim multiple finalized withdrawal requests                                |
| burn-stv-for-withdrawal-queue \<address> \<stv>                                                | burn stv from WithdrawalQueue contract when processing withdrawal requests  |
| disconnect-vault \<address>                                                                    | initiates voluntary vault disconnection from VaultHub                       |
| claim-connect-deposit \<address>                                                               | claims the connect deposit after vault has been disconnected                |
| trigger-validator-withdrawals \<address> \<pubkeys> \<amounts> \<refundRecipient>              | triggers validator withdrawals                                              |
| request-validator-exit \<address> \<pubkeys>                                                   | requests validator exit                                                     |
| add-to-allow-list \<address> \<user>                                                           | add an address to the allowlist                                             |
| remove-from-allow-list \<address> \<user>                                                      | remove an address from the allowlist                                        |
| mint-steth-shares \<address> \<stethShares>                                                    | mint stETH shares up to the user's minting capacity                         |
| burn-steth-shares \<address> \<stethShares>                                                    | burn stETH shares to reduce the user's minted stETH obligation              |
| rebalance-minted-steth-shares \<address> \<stethShares> \<maxStvToBurn>                        | rebalance the user's minted stETH shares by burning stv                     |
| transfer-with-liability \<address> \<to> \<stv> \<stethShares>                                 | transfer stETH shares with liability to another address                     |

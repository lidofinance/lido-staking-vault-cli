---
sidebar_position: 4
---

# StvPool

## Command

```bash
yarn start defi-wrapper contracts stv [arguments] [-options]
```

## StvPool commands list

```bash
yarn start defi-wrapper contracts stv -h
```

## API

| Command   | Description    |
| --------- | -------------- |
| read (r)  | read commands  |
| write (w) | write commands |

### Read

| Command                                                | Description                                                                     |
| ------------------------------------------------------ | ------------------------------------------------------------------------------- |
| info \<address>                                        | get stv pool base info                                                          |
| ALLOW_LIST_ENABLED \<address>                          | Calls the read-only function "ALLOW_LIST_ENABLED" on the contract.              |
| ALLOW_LIST_MANAGER_ROLE \<address>                     | Calls the read-only function "ALLOW_LIST_MANAGER_ROLE" on the contract.         |
| DASHBOARD \<address>                                   | Calls the read-only function "DASHBOARD" on the contract.                       |
| DEFAULT_ADMIN_ROLE \<address>                          | Calls the read-only function "DEFAULT_ADMIN_ROLE" on the contract.              |
| DEPOSITS_FEATURE \<address>                            | Calls the read-only function "DEPOSITS_FEATURE" on the contract.                |
| DEPOSITS_PAUSE_ROLE \<address>                         | Calls the read-only function "DEPOSITS_PAUSE_ROLE" on the contract.             |
| DEPOSITS_RESUME_ROLE \<address>                        | Calls the read-only function "DEPOSITS_RESUME_ROLE" on the contract.            |
| DEPOSIT_ROLE \<address>                                | Calls the read-only function "DEPOSIT_ROLE" on the contract.                    |
| DISTRIBUTOR \<address>                                 | Calls the read-only function "DISTRIBUTOR" on the contract.                     |
| STETH \<address>                                       | Calls the read-only function "STETH" on the contract.                           |
| TOTAL_BASIS_POINTS \<address>                          | Calls the read-only function "TOTAL_BASIS_POINTS" on the contract.              |
| VAULT \<address>                                       | Calls the read-only function "VAULT" on the contract.                           |
| VAULT_HUB \<address>                                   | Calls the read-only function "VAULT_HUB" on the contract.                       |
| WITHDRAWAL_QUEUE \<address>                            | Calls the read-only function "WITHDRAWAL_QUEUE" on the contract.                |
| allowance \<address> \<owner> \<spender>               | Calls the read-only function "allowance" on the contract.                       |
| assetsOf \<address> \<\_account>                       | Calls the read-only function "assetsOf" on the contract.                        |
| balanceOf \<address> \<account>                        | Calls the read-only function "balanceOf" on the contract.                       |
| decimals \<address>                                    | Calls the read-only function "decimals" on the contract.                        |
| getAllowListAddresses \<address>                       | Calls the read-only function "getAllowListAddresses" on the contract.           |
| getAllowListSize \<address>                            | Calls the read-only function "getAllowListSize" on the contract.                |
| getRoleAdmin \<address> \<role>                        | Calls the read-only function "getRoleAdmin" on the contract.                    |
| getRoleMember \<address> \<role> \<index>              | Calls the read-only function "getRoleMember" on the contract.                   |
| getRoleMemberCount \<address> \<role>                  | Calls the read-only function "getRoleMemberCount" on the contract.              |
| getRoleMembers \<address> \<role>                      | Calls the read-only function "getRoleMembers" on the contract.                  |
| hasRole \<address> \<role> \<account>                  | Calls the read-only function "hasRole" on the contract.                         |
| is-allow-listed \<address> \<user>                     | get whether the address is allow listed                                         |
| isFeaturePaused \<address> \<\_featureId>              | Calls the read-only function "isFeaturePaused" on the contract.                 |
| name \<address>                                        | Calls the read-only function "name" on the contract.                            |
| nominalAssetsOf \<address> \<\_account>                | Calls the read-only function "nominalAssetsOf" on the contract.                 |
| poolType \<address>                                    | Calls the read-only function "poolType" on the contract.                        |
| preview-deposit \<address> \<assets>                   | get preview the amount of stv that would be received for a given asset amount   |
| preview-redeem \<address> \<stv>                       | get preview the amount of assets that would be received for a given stv amount  |
| preview-withdraw \<address> \<assets>                  | get preview the amount of stv that would be burned for a given asset withdrawal |
| supportsInterface \<address> \<interfaceId>            | Calls the read-only function "supportsInterface" on the contract.               |
| symbol \<address>                                      | Calls the read-only function "symbol" on the contract.                          |
| total-assets ta\<address>                              | get the total assets managed by the pool                                        |
| total-liability-shares tls\<address>                   | get the total liability stETH shares issued to the vault                        |
| total-nominal-assets tna\<address>                     | get the total nominal assets managed by the pool                                |
| totalSupply \<address>                                 | Calls the read-only function "totalSupply" on the contract.                     |
| total-unassigned-liability-shares tul-shares\<address> | get the total liability stETH shares that are not assigned to any users         |
| total-unassigned-liability-steth tul-steth\<address>   | get the total unassigned liability in stETH                                     |

### Write

| Command                                                       | Description                                                                 |
| ------------------------------------------------------------- | --------------------------------------------------------------------------- |
| deposit-eth \<address> \<amount> \<referral>                  | convenience function to deposit ETH to msg.sender                           |
| rebalance-unassigned-liability \<address> \<stethShares>      | rebalance unassigned liability by repaying it with assets held by the vault |
| rebalance-unassigned-liability-with-ether \<address> \<ether> | rebalance unassigned liability by repaying it with external ether           |
| pause-deposits \<address>                                     | pause deposits                                                              |
| resume-deposits \<address>                                    | resume deposits                                                             |
| burn-stv-for-withdrawal-queue \<address> \<stv>               | burn stv from WithdrawalQueue contract when processing withdrawal requests  |
| add-to-allow-list \<address> \<user>                          | add an address to the allowlist                                             |
| remove-from-allow-list \<address> \<user>                     | remove an address from the allowlist                                        |

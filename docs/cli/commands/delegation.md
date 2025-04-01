---
sidebar_position: 6
---

# Delegation

## Command

```bash
lsv-cli delegation [arguments] [-options]
```

## Delegation commands list

```bash
lsv-cli delegation -h
```

## API

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
| health \<address>                                          | get vault health info                                                                                                   |
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

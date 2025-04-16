---
sidebar_position: 5
---

# Dashboard

## Command

```bash
lsv-cli dashboard [arguments] [-options]
```

## Dashboard commands list

```bash
lsv-cli dashboard -h
```

## API

| Command                                                                    | Description                                                                                                             |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| info                                                                       | get dashboard base info                                                                                                 |
| health \<address>                                                          | get vault health info                                                                                                   |
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
| ownership \<address> \<newOwner>                                           | transfers ownership of the staking vault to a new owner                                                                 |
| disconnect \<address>                                                      | disconnects the staking vault from the vault hub                                                                        |
| fund                                                                       | funds the staking vault with ether                                                                                      |
| fund-weth \<address> \<wethAmount>                                         | funds the staking vault with wrapped ether                                                                              |
| withdraw \<address> \<recipient> \<eth>                                    | withdraws ether from the staking vault to a recipient                                                                   |
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

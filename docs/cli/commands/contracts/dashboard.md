---
sidebar_position: 1
---

# Dashboard

## Command

```bash
yarn start contracts dashboard [arguments] [-options]
```

## Dashboard commands list

```bash
yarn start contracts dashboard -h
```

## API

| Command   | Description    |
| --------- | -------------- |
| read (r)  | read commands  |
| write (w) | write commands |

### Read

| Command                                               | Description                                                                                               |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| info \<address>                                       | get dashboard base info                                                                                   |
| overview \<address>                                   | get dashboard overview                                                                                    |
| roles \<address>                                      | get dashboard roles                                                                                       |
| health \<address>                                     | get vault health info                                                                                     |
| dashboard-address-by-vault dashboard-by-vault\<vault> | get dashboard address by vault                                                                            |
| confirmations-log \<address>                          | get pending confirmations                                                                                 |
| BURN_ROLE \<address>                                  | Calls the read-only function "BURN_ROLE" on the contract.                                                 |
| CHANGE_TIER_ROLE \<address>                           | Calls the read-only function "CHANGE_TIER_ROLE" on the contract.                                          |
| DEFAULT_ADMIN_ROLE \<address>                         | Calls the read-only function "DEFAULT_ADMIN_ROLE" on the contract.                                        |
| ETH \<address>                                        | Calls the read-only function "ETH" on the contract.                                                       |
| FUND_ON_RECEIVE_FLAG_SLOT \<address>                  | Calls the read-only function "FUND_ON_RECEIVE_FLAG_SLOT" on the contract.                                 |
| FUND_ROLE \<address>                                  | Calls the read-only function "FUND_ROLE" on the contract.                                                 |
| LIDO_LOCATOR \<address>                               | Calls the read-only function "LIDO_LOCATOR" on the contract.                                              |
| manual-rewards-adjustment-limit \<address>            | get the maximum value that can be set via manual adjustment                                               |
| MAX_CONFIRM_EXPIRY \<address>                         | get the max confirm expiry                                                                                |
| MINT_ROLE \<address>                                  | Calls the read-only function "MINT_ROLE" on the contract.                                                 |
| MIN_CONFIRM_EXPIRY \<address>                         | get the min confirm expiry                                                                                |
| NODE_OPERATOR_MANAGER_ROLE \<address>                 | Calls the read-only function "NODE_OPERATOR_MANAGER_ROLE" on the contract.                                |
| NODE_OPERATOR_REWARDS_ADJUST_ROLE \<address>          | Calls the read-only function "NODE_OPERATOR_REWARDS_ADJUST_ROLE" on the contract.                         |
| PAUSE_BEACON_CHAIN_DEPOSITS_ROLE \<address>           | Calls the read-only function "PAUSE_BEACON_CHAIN_DEPOSITS_ROLE" on the contract.                          |
| PDG_COMPENSATE_PREDEPOSIT_ROLE \<address>             | Calls the read-only function "PDG_COMPENSATE_PREDEPOSIT_ROLE" on the contract.                            |
| PDG_PROVE_VALIDATOR_ROLE \<address>                   | Calls the read-only function "PDG_PROVE_VALIDATOR_ROLE" on the contract.                                  |
| REBALANCE_ROLE \<address>                             | Calls the read-only function "REBALANCE_ROLE" on the contract.                                            |
| RECOVER_ASSETS_ROLE \<address>                        | Calls the read-only function "RECOVER_ASSETS_ROLE" on the contract.                                       |
| REQUEST_VALIDATOR_EXIT_ROLE \<address>                | Calls the read-only function "REQUEST_VALIDATOR_EXIT_ROLE" on the contract.                               |
| RESUME_BEACON_CHAIN_DEPOSITS_ROLE \<address>          | Calls the read-only function "RESUME_BEACON_CHAIN_DEPOSITS_ROLE" on the contract.                         |
| STETH \<address>                                      | Calls the read-only function "STETH" on the contract.                                                     |
| TRIGGER_VALIDATOR_WITHDRAWAL_ROLE \<address>          | Calls the read-only function "TRIGGER_VALIDATOR_WITHDRAWAL_ROLE" on the contract.                         |
| UNGUARANTEED_BEACON_CHAIN_DEPOSIT_ROLE \<address>     | Calls the read-only function "UNGUARANTEED_BEACON_CHAIN_DEPOSIT_ROLE" on the contract.                    |
| hub \<address>                                        | get vaultHub address                                                                                      |
| VOLUNTARY_DISCONNECT_ROLE \<address>                  | Calls the read-only function "VOLUNTARY_DISCONNECT_ROLE" on the contract.                                 |
| WITHDRAW_ROLE \<address>                              | Calls the read-only function "WITHDRAW_ROLE" on the contract.                                             |
| WSTETH \<address>                                     | Calls the read-only function "WSTETH" on the contract.                                                    |
| confirmation \<address> \<\_callData> \<\_role>       | get the confirmation expiry for a given call data and confirmer                                           |
| confirming-roles \<address>                           | get confirming roles                                                                                      |
| no-fee-report \<address>                              | get last report for which node operator fee was disbursed. Updated on each disbursement                   |
| force-rebalance-threshold \<address>                  | get the rebalance threshold of the vault in basis points                                                  |
| get-confirm-expiry \<address>                         | get the confirmation expiry                                                                               |
| getRoleAdmin \<address> \<role>                       | Calls the read-only function "getRoleAdmin" on the contract.                                              |
| getRoleMember \<address> \<role> \<index>             | Calls the read-only function "getRoleMember" on the contract.                                             |
| getRoleMemberCount \<address> \<role>                 | Calls the read-only function "getRoleMemberCount" on the contract.                                        |
| getRoleMembers \<address> \<role>                     | Calls the read-only function "getRoleMembers" on the contract.                                            |
| has-role \<address> \<role> \<account>                | get has role by role and account                                                                          |
| infra-fee \<address>                                  | get infra fee basis points.                                                                               |
| initialized \<address>                                | Calls the read-only function "initialized" on the contract.                                               |
| latestReport \<address>                               | Calls the read-only function "latestReport" on the contract.                                              |
| liability-shares \<address>                           | get the number of stETHshares minted                                                                      |
| liquidity-fee \<address>                              | get liquidity fee basis points                                                                            |
| locked \<address>                                     | get the locked amount of ether for the vault                                                              |
| maxLockableValue \<address>                           | Calls the read-only function "maxLockableValue" on the contract.                                          |
| no-disbursable-fee \<address>                         | get the node operator`s disbursable fee                                                                   |
| no-fee-rate \<address>                                | get node operator fee rate in basis points                                                                |
| nodeOperatorFeeRecipient \<address>                   | Calls the read-only function "nodeOperatorFeeRecipient" on the contract.                                  |
| remaining-minting-capacity \<address> \<etherToFund>  | get the remaining capacity for stETH shares that can be minted by the vault if additional ether is funded |
| reservation-fee \<address>                            | get reservation fee basis points                                                                          |
| reserve-ratio \<address>                              | get reserve ratio in basis points                                                                         |
| rewards-adjustment \<address>                         | get rewards offset that excludes side deposits and consolidations                                         |
| s-limit \<address>                                    | get the stETH share limit of the vault                                                                    |
| vault \<address>                                      | get staking vault address                                                                                 |
| supports-interface \<address> \<interfaceId>          | get supports interface by id                                                                              |
| total-minting-capacity \<address>                     | get the overall capacity for stETH shares that can be minted by the vault                                 |
| total-value \<address>                                | get the total value of the vault in ether                                                                 |
| unsettledObligations \<address>                       | Calls the read-only function "unsettledObligations" on the contract.                                      |
| vault-connection \<address>                           | get vault connection                                                                                      |
| w-ether \<address>                                    | get amount of ether that can be withdrawn from the staking vault                                          |

### Write

| Command                                                                              | Description                                                                                                                                                                                                            |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| transfer-vault-ownership \<address> \<newOwner>                                      | transfers the ownership of the underlying StakingVault from this contract to a new owner without disconnecting it from the hub                                                                                         |
| voluntary-disconnect \<address>                                                      | disconnects the staking vault from the vault hub                                                                                                                                                                       |
| fund \<address> \<ether>                                                             | funds the staking vault with ether                                                                                                                                                                                     |
| withdraw \<address> \<recipient> \<eth>                                              | withdraws ether from the staking vault to a recipient                                                                                                                                                                  |
| exit \<address> \<validatorPubKey>                                                   | requests the exit of a validator from the staking vault                                                                                                                                                                |
| trigger-validator-withdrawal \<address> \<pubkeys> \<amounts> \<recipient>           | triggers the withdrawal of a validator from the staking vault                                                                                                                                                          |
| mint-shares mint\<address> \<recipient> \<amountOfShares>                            | mints stETH tokens backed by the vault to a recipient                                                                                                                                                                  |
| mint-steth \<address> \<recipient> \<amountOfSteth>                                  | mints stETH tokens backed by the vault to a recipient                                                                                                                                                                  |
| mint-wsteth \<address> \<recipient> \<amountOfWsteth>                                | mints wstETH tokens backed by the vault to a recipient                                                                                                                                                                 |
| burn-shares burn\<address> \<amountOfShares>                                         | Burns stETH shares from the sender backed by the vault. Expects corresponding amount of stETH approved to this contract                                                                                                |
| burn-steth \<address> \<amountOfShares>                                              | Burns stETH shares from the sender backed by the vault. Expects stETH amount approved to this contract.                                                                                                                |
| burn-wsteth \<address> \<tokens>                                                     | burn wstETH tokens from the sender backed by the vault                                                                                                                                                                 |
| rebalance-ether \<address> \<ether>                                                  | rebalance the vault by transferring ether                                                                                                                                                                              |
| rebalance-shares \<address> \<shares>                                                | rebalance the vault by transferring shares                                                                                                                                                                             |
| recover-erc20 \<address> \<token> \<recipient> \<amount>                             | recovers ERC20 tokens or ether from the dashboard contract to sender                                                                                                                                                   |
| recover-erc721 \<address> \<token> \<tokenId> \<recipient>                           | Transfers a given token_id of an ERC721-compatible NFT (defined by the token contract address)                                                                                                                         |
| deposit-pause \<address>                                                             | Pauses beacon chain deposits on the staking vault.                                                                                                                                                                     |
| deposit-resume \<address>                                                            | Mass-grants multiple roles to multiple accounts.                                                                                                                                                                       |
| role-grant \<address> \<roleAssignmentJSON>                                          | Mass-revokes multiple roles from multiple accounts.                                                                                                                                                                    |
| role-revoke \<address> \<roleAssignmentJSON>                                         | Resumes beacon chain deposits on the staking vault.                                                                                                                                                                    |
| compensate-disproven-predeposit compensate\<address> \<pubkey> \<recipient>          | Compensates ether of disproven validator`s predeposit from PDG to the recipient                                                                                                                                        |
| unguaranteed-deposit-to-beacon-chain unguaranteed-deposit\<address> \<deposits>      | Withdraws ether from vault and deposits directly to provided validators bypassing the default PDG process                                                                                                              |
| prove-unknown-validators-to-pdg prove-unknown-validators\<address> \<validatorIndex> | Proves validators with correct vault WC if they are unknown to PDG                                                                                                                                                     |
| abandon-dashboard abandon\<address>                                                  | accepts the ownership over the StakingVault transferred from VaultHub on disconnect and immediately transfers it to a new pending owner. This new owner will have to accept the ownership on the StakingVault contract |
| connect-to-vault-hub connect-hub\<address>                                           | connects to VaultHub, transferring ownership to VaultHub.                                                                                                                                                              |
| reconnect-to-vault-hub reconnect-hub\<address>                                       | accepts the ownership over the StakingVault and connects to VaultHub. Can be called to reconnect to the hub after voluntaryDisconnect()                                                                                |
| connect-and-accept-tier connect-and-accept\<address> \<tier> \<requestedShareLimit>  | changes the tier of the vault and connects to VaultHub                                                                                                                                                                 |
| increase-rewards-adjustment \<address> \<amount>                                     | increases rewards adjustment to correct fee calculation due to non-rewards ether on CL                                                                                                                                 |
| set-rewards-adjustment \<address> \<amount>                                          | set `rewardsAdjustment` to a new proposed value if `confirmingRoles()` agree                                                                                                                                           |
| confirm-proposal \<address>                                                          | Confirms a proposal                                                                                                                                                                                                    |
| set-confirm-expiry \<address> \<expiry>                                              | Sets the confirm expiry                                                                                                                                                                                                |
| set-node-operator-fee-rate \<address> \<fee>                                         | updates the node-operator`s fee rate (basis-points share)                                                                                                                                                              |

**\<roleAssignmentJSON>**

```json
[{
  "account": string as Address;
  "role": string as `0x${string}`;
}]
```

**\<deposits>**

```json
[{
  "pubkey": "...",
  "signature": "...",
  "amount": number,
  "deposit_data_root": "..."
}]
```

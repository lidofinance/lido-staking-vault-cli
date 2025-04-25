---
sidebar_position: 5
---

# Dashboard

## Command

```bash
yarn start dashboard [arguments] [-options]
```

## Dashboard commands list

```bash
yarn start dashboard -h
```

## API

| Command   | Description    |
| --------- | -------------- |
| read (r)  | read commands  |
| write (w) | write commands |

### Read

| Command                                                 | Description                                                                                               |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| info \<address>                                         | get dashboard base info                                                                                   |
| overview \<address>                                     | get dashboard overview                                                                                    |
| roles \<address>                                        | get dashboard roles                                                                                       |
| health \<address>                                       | get vault health info                                                                                     |
| locked \<address>                                       | get locked info                                                                                           |
| required-lock-by-shares req-lock\<address> \<newShares> | get required lock by shares                                                                               |
| BURN_ROLE \<address>                                    | Calls the read-only function "BURN_ROLE" on the contract.                                                 |
| DEFAULT_ADMIN_ROLE \<address>                           | Calls the read-only function "DEFAULT_ADMIN_ROLE" on the contract.                                        |
| ETH \<address>                                          | Calls the read-only function "ETH" on the contract.                                                       |
| FUND_ROLE \<address>                                    | Calls the read-only function "FUND_ROLE" on the contract.                                                 |
| LIDO_VAULTHUB_AUTHORIZATION_ROLE \<address>             | Calls the read-only function "LIDO_VAULTHUB_AUTHORIZATION_ROLE" on the contract.                          |
| LIDO_VAULTHUB_DEAUTHORIZATION_ROLE \<address>           | Calls the read-only function "LIDO_VAULTHUB_DEAUTHORIZATION_ROLE" on the contract.                        |
| LOCK_ROLE \<address>                                    | Calls the read-only function "LOCK_ROLE" on the contract.                                                 |
| MANUAL_ACCRUED_REWARDS_ADJUSTMENT_LIMIT \<address>      | get the manual accrued rewards adjustment limit                                                           |
| MAX_CONFIRM_EXPIRY \<address>                           | get the max confirm expiry                                                                                |
| MINT_ROLE \<address>                                    | Calls the read-only function "MINT_ROLE" on the contract.                                                 |
| MIN_CONFIRM_EXPIRY \<address>                           | get the min confirm expiry                                                                                |
| NODE_OPERATOR_FEE_CLAIM_ROLE \<address>                 | Calls the read-only function "NODE_OPERATOR_FEE_CLAIM_ROLE" on the contract.                              |
| NODE_OPERATOR_MANAGER_ROLE \<address>                   | Calls the read-only function "NODE_OPERATOR_MANAGER_ROLE" on the contract.                                |
| NODE_OPERATOR_REWARDS_ADJUST_ROLE \<address>            | Calls the read-only function "NODE_OPERATOR_REWARDS_ADJUST_ROLE" on the contract.                         |
| OSSIFY_ROLE \<address>                                  | Calls the read-only function "OSSIFY_ROLE" on the contract.                                               |
| PAUSE_BEACON_CHAIN_DEPOSITS_ROLE \<address>             | Calls the read-only function "PAUSE_BEACON_CHAIN_DEPOSITS_ROLE" on the contract.                          |
| PDG_COMPENSATE_PREDEPOSIT_ROLE \<address>               | Calls the read-only function "PDG_COMPENSATE_PREDEPOSIT_ROLE" on the contract.                            |
| PDG_PROVE_VALIDATOR_ROLE \<address>                     | Calls the read-only function "PDG_PROVE_VALIDATOR_ROLE" on the contract.                                  |
| REBALANCE_ROLE \<address>                               | Calls the read-only function "REBALANCE_ROLE" on the contract.                                            |
| RECOVER_ASSETS_ROLE \<address>                          | Calls the read-only function "RECOVER_ASSETS_ROLE" on the contract.                                       |
| REQUEST_TIER_CHANGE_ROLE \<address>                     | Calls the read-only function "REQUEST_TIER_CHANGE_ROLE" on the contract.                                  |
| REQUEST_VALIDATOR_EXIT_ROLE \<address>                  | Calls the read-only function "REQUEST_VALIDATOR_EXIT_ROLE" on the contract.                               |
| RESET_LOCKED_ROLE \<address>                            | Calls the read-only function "RESET_LOCKED_ROLE" on the contract.                                         |
| RESUME_BEACON_CHAIN_DEPOSITS_ROLE \<address>            | Calls the read-only function "RESUME_BEACON_CHAIN_DEPOSITS_ROLE" on the contract.                         |
| SET_DEPOSITOR_ROLE \<address>                           | Calls the read-only function "SET_DEPOSITOR_ROLE" on the contract.                                        |
| STETH \<address>                                        | Calls the read-only function "STETH" on the contract.                                                     |
| TRIGGER_VALIDATOR_WITHDRAWAL_ROLE \<address>            | Calls the read-only function "TRIGGER_VALIDATOR_WITHDRAWAL_ROLE" on the contract.                         |
| UNGUARANTEED_BEACON_CHAIN_DEPOSIT_ROLE \<address>       | Calls the read-only function "UNGUARANTEED_BEACON_CHAIN_DEPOSIT_ROLE" on the contract.                    |
| VAULT_HUB \<address>                                    | Calls the read-only function "VAULT_HUB" on the contract.                                                 |
| VOLUNTARY_DISCONNECT_ROLE \<address>                    | Calls the read-only function "VOLUNTARY_DISCONNECT_ROLE" on the contract.                                 |
| WITHDRAW_ROLE \<address>                                | Calls the read-only function "WITHDRAW_ROLE" on the contract.                                             |
| WSTETH \<address>                                       | Calls the read-only function "WSTETH" on the contract.                                                    |
| accrued-rewards-adjustment \<address>                   | get adjustment to allow fee correction during side deposits or consolidations.                            |
| confirmations \<address> \<callData> \<role>            | get tracks confirmations                                                                                  |
| confirming-roles \<address>                             | get confirming roles                                                                                      |
| force-rebalance-threshold \<address>                    | get the rebalance threshold of the vault in basis points                                                  |
| get-confirm-expiry \<address>                           | get the confirmation expiry                                                                               |
| getRoleAdmin \<address> \<role>                         | Calls the read-only function "getRoleAdmin" on the contract.                                              |
| getRoleMember \<address> \<role> \<index>               | Calls the read-only function "getRoleMember" on the contract.                                             |
| getRoleMemberCount \<address> \<role>                   | Calls the read-only function "getRoleMemberCount" on the contract.                                        |
| getRoleMembers \<address> \<role>                       | Calls the read-only function "getRoleMembers" on the contract.                                            |
| has-role \<address> \<role> \<account>                  | get has role by role and account                                                                          |
| initialized \<address>                                  | Calls the read-only function "initialized" on the contract.                                               |
| liability-shares \<address>                             | get the number of stETHshares minted                                                                      |
| no-fee \<address>                                       | get node operator fee in basis points                                                                     |
| no-fee-report \<address>                                | get node operator fee claimed report                                                                      |
| no-unclaimed-fee \<address>                             | returns the accumulated unclaimed node operator fee in ether                                              |
| remaining-minting-capacity \<address> \<etherToFund>    | get the remaining capacity for stETH shares that can be minted by the vault if additional ether is funded |
| reserve-ratio \<address>                                | get reserve ratio in basis points                                                                         |
| s-limit \<address>                                      | get the stETH share limit of the vault                                                                    |
| vault \<address>                                        | get staking vault address                                                                                 |
| supports-interface \<address> \<interfaceId>            | get supports interface by id                                                                              |
| total-mintable-capacity \<address>                      | get the overall capacity for stETH shares that can be minted by the vault                                 |
| total-value \<address>                                  | get the total value of the vault in ether                                                                 |
| t-fee \<address>                                        | get treasury fee in basis points                                                                          |
| unreserved \<address>                                   | get the unreserved amount of ether                                                                        |
| socket \<address>                                       | get vault socket                                                                                          |
| w-ether \<address>                                      | get amount of ether that can be withdrawn from the staking vault                                          |

### Write

| Command                                                                         | Description                                                                                                             |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| ownership \<address> \<newOwner>                                                | transfers ownership of the staking vault to a new owner                                                                 |
| disconnect \<address>                                                           | disconnects the staking vault from the vault hub                                                                        |
| fund \<address> \<ether>                                                        | funds the staking vault with ether                                                                                      |
| withdraw \<address> \<recipient> \<eth>                                         | withdraws ether from the staking vault to a recipient                                                                   |
| lock \<address> \<lockedAmount>                                                 | updates the locked amount of the staking vault                                                                          |
| exit \<address> \<validatorPubKey>                                              | requests the exit of a validator from the staking vault                                                                 |
| trigger-validator-withdrawal \<address> \<pubkeys> \<amounts> \<recipient>      | triggers the withdrawal of a validator from the staking vault                                                           |
| mint-shares mint\<address> \<recipient> \<amountOfShares>                       | mints stETH tokens backed by the vault to a recipient                                                                   |
| mint-steth \<address> \<recipient> \<amountOfSteth>                             | mints stETH tokens backed by the vault to a recipient                                                                   |
| mint-wsteth \<address> \<recipient> \<amountOfWsteth>                           | mints wstETH tokens backed by the vault to a recipient                                                                  |
| burn-shares burn\<address> \<amountOfShares>                                    | Burns stETH shares from the sender backed by the vault. Expects corresponding amount of stETH approved to this contract |
| burn-steth \<address> \<amountOfShares>                                         | Burns stETH shares from the sender backed by the vault. Expects stETH amount approved to this contract.                 |
| burn-wsteth \<address> \<tokens>                                                | burn wstETH tokens from the sender backed by the vault                                                                  |
| rebalance \<address> \<ether>                                                   | rebalance the vault by transferring ether                                                                               |
| recover-erc20 \<address> \<token> \<recipient> \<amount>                        | recovers ERC20 tokens or ether from the dashboard contract to sender                                                    |
| recover-erc721 \<address> \<token> \<tokenId> \<recipient>                      | Transfers a given token_id of an ERC721-compatible NFT (defined by the token contract address)                          |
| deposit-pause \<address>                                                        | Pauses beacon chain deposits on the staking vault.                                                                      |
| deposit-resume \<address>                                                       | Mass-grants multiple roles to multiple accounts.                                                                        |
| role-grant \<address> \<roleAssignmentJSON>                                     | Mass-revokes multiple roles from multiple accounts.                                                                     |
| role-revoke \<address> \<roleAssignmentJSON>                                    | Resumes beacon chain deposits on the staking vault.                                                                     |
| compensate-disproven-predeposit compensate\<address> \<pubkey> \<recipient>     | Compensates ether of disproven validator`s predeposit from PDG to the recipient                                         |
| unguaranteed-deposit-to-beacon-chain unguaranteed-deposit\<address> \<deposits> | Withdraws ether from vault and deposits directly to provided validators bypassing the default PDG process               |
| prove-unknown-validators-to-pdg prove-unknown-validators\<address> \<witnesses> | Proves validators with correct vault WC if they are unknown to PDG                                                      |
| authorize-lido-vault-hub authorize-hub\<address>                                | Authorizes the Lido Vault Hub to manage the staking vault.                                                              |
| deauthorize-lido-vault-hub deauthorize-hub\<address>                            | Deauthorizes the Lido Vault Hub from managing the staking vault.                                                        |
| ossify-staking-vault ossify\<address>                                           | Ossifies the staking vault.                                                                                             |
| set-depositor \<address> \<depositor>                                           | Updates the address of the depositor for the staking vault.                                                             |
| reset-locked \<address>                                                         | Zeroes the locked amount of the staking vault.                                                                          |
| request-tier-change \<address> \<tier>                                          | Requests a change of tier on the OperatorGrid.                                                                          |
| increase-accrued-rewards-adjustment \<address> \<amount>                        | Increases the accrued rewards adjustment.                                                                               |
| set-accrued-rewards-adjustment \<address> \<amount>                             | Sets the accrued rewards adjustment.                                                                                    |

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

**\<deposits>**

```json
{
  "pubkey": "...",
  "signature": "...",
  "amount": number,
  "deposit_data_root": "..."
}
```

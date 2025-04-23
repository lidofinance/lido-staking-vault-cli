---
sidebar_position: 4
---

# Vault

## Command

```bash
yarn start vault [arguments] [-options]
```

## Vault commands list

```bash
yarn start vault -h
```

## API

| Command   | Description    |
| --------- | -------------- |
| read (r)  | read commands  |
| write (w) | write commands |

### Read

| Command                                    | Description                                                           |
| ------------------------------------------ | --------------------------------------------------------------------- |
| info \<address>                            | get vault base info                                                   |
| DEPOSIT_CONTRACT \<address>                | get vault deposit contract                                            |
| PUBLIC_KEY_LENGTH \<address>               | Calls the read-only function "PUBLIC_KEY_LENGTH" on the contract.     |
| is-paused-deposits \<address>              | get whether deposits are paused by the vault owner                    |
| validator-w-fee \<address> \<numberOfKeys> | get calculated withdrawal fee for a validator                         |
| depositor \<address>                       | get the address of the depositor                                      |
| getInitializedVersion \<address>           | Calls the read-only function "getInitializedVersion" on the contract. |
| delta \<address>                           | get the net difference between deposits and withdrawals               |
| isReportFresh \<address>                   | Calls the read-only function "isReportFresh" on the contract.         |
| l-report \<address>                        | get latest vault report                                               |
| locked \<address>                          | get vault locked                                                      |
| no \<address>                              | get vault node operator                                               |
| ossified \<address>                        | Calls the read-only function "ossified" on the contract.              |
| owner \<address>                           | get vault owner                                                       |
| totalValue \<address>                      | Calls the read-only function "totalValue" on the contract.            |
| unlocked \<address>                        | get vault unlocked                                                    |
| vault-hub \<address>                       | get vault hub                                                         |
| vaultHubAuthorized \<address>              | Calls the read-only function "vaultHubAuthorized" on the contract.    |
| version \<address>                         | get vault version                                                     |
| wc \<address>                              | get vault withdrawal credentials                                      |

### Write

| Command                                                                                   | Description                                                          |
| ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| fund                                                                                      | fund vault                                                           |
| withdraw \<address> \<recipient> \<eth>                                                   | withdraw from vault                                                  |
| no-deposit-beacon \<address> \<amountOfDeposit> \<pubkey> \<signature> \<depositDataRoot> | deposit to beacon chain                                              |
| no-val-exit \<address> \<validatorPublicKey>                                              | request to exit validator                                            |
| bc-resume \<address>                                                                      | Resumes deposits to beacon chain                                     |
| bc-pause \<address>                                                                       | Pauses deposits to beacon chain                                      |
| report \<address> \<timestamp> \<totalValue> \<inOutDelta> \<locked>                      | Submits a report containing valuation, inOutDelta, and locked amount |
| rebalance \<address> \<amount>                                                            | Rebalances the vault                                                 |
| trigger-v-w \<address> \<pubkeys> \<amounts> \<refundRecipient>                           | Trigger validator withdrawal                                         |
| authorize-lido-vault-hub authorize-hub\<address>                                          | Authorizes the Lido Vault Hub to manage the staking vault.           |
| deauthorize-lido-vault-hub deauthorize-hub\<address>                                      | Deauthorizes the Lido Vault Hub from managing the staking vault.     |
| ossify \<address>                                                                         | Ossifies the staking vault.                                          |
| reset-l \<ocked> \<address>                                                               | Resets the locked amount                                             |
| set-depositor \<address> \<depositor>                                                     | Sets the depositor                                                   |

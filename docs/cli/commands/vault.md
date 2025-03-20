---
sidebar_position: 4
---

# Vault

## Command

```bash
lsv-cli vault [arguments] [-options]
```

## Vault commands list

```bash
lsv-cli vault -h
```

## API

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

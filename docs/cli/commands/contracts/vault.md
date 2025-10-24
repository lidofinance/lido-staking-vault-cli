---
sidebar_position: 7
---

# Vault

## Command

```bash
yarn start contracts vault [arguments] [-options]
```

## Vault commands list

```bash
yarn start contracts vault -h
```

## API

| Command   | Description    |
| --------- | -------------- |
| read (r)  | read commands  |
| write (w) | write commands |

### Read

| Command                                    | Description                                                                                             |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| info \<address>                            | get vault base info                                                                                     |
| DEPOSIT_CONTRACT \<address>                | get vault deposit contract                                                                              |
| available-balance \<address>               | get the balance that is available for withdrawal (does not account the balances staged for activations) |
| is-paused-deposits \<address>              | get whether deposits are paused by the vault owner                                                      |
| validator-w-fee \<address> \<numberOfKeys> | get calculated withdrawal fee for a validator                                                           |
| depositor \<address>                       | get the address of the depositor                                                                        |
| getInitializedVersion \<address>           | Calls the read-only function "getInitializedVersion" on the contract.                                   |
| no \<address>                              | get vault node operator                                                                                 |
| owner \<address>                           | get vault owner                                                                                         |
| pending-owner \<address>                   | get the pending owner of the contract                                                                   |
| staged-balance \<address>                  | get the amount of ether on the balance that was staged by depositor for validator activations           |
| version \<address>                         | get vault version                                                                                       |
| wc \<address>                              | get vault withdrawal credentials                                                                        |

### Write

| Command                                                                                   | Description                                                                                                                                                             |
| ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| fund                                                                                      | fund vault                                                                                                                                                              |
| withdraw \<address> \<recipient> \<eth>                                                   | withdraw from vault                                                                                                                                                     |
| no-deposit-beacon \<address> \<amountOfDeposit> \<pubkey> \<signature> \<depositDataRoot> | performs deposit to the beacon chain using ether from available balance                                                                                                 |
| stage \<address> \<amount>                                                                | puts aside some ether from the balance to deposit it later                                                                                                              |
| unstage \<address> \<amount>                                                              | returns the ether staged for deposits back to available balance                                                                                                         |
| deposit-from-staged \<address> \<deposit> \<additionalAmount>                             | performs deposits to the beacon chain using the staged and available ether.                                                                                             |
| no-val-exit \<address> \<validatorPublicKeys>                                             | requests node operator to exit validators from the beacon chain. It does not directly trigger exits - node operators must monitor for these events and handle the exits |
| bc-resume \<address>                                                                      | Resumes deposits to beacon chain                                                                                                                                        |
| bc-pause \<address>                                                                       | Pauses deposits to beacon chain                                                                                                                                         |
| trigger-v-w \<address> \<pubkeys> \<amounts> \<refundRecipient>                           | Trigger validator withdrawal                                                                                                                                            |
| eject-validators \<address> \<pubkeys> \<refundRecipient>                                 | triggers EIP-7002 validator exits by the node operator.                                                                                                                 |
| ossify \<address>                                                                         | Ossifies the staking vault.                                                                                                                                             |
| set-depositor \<address> \<depositor>                                                     | Sets the depositor                                                                                                                                                      |
| transfer-ownership \<address> \<newOwner>                                                 | Transfers the ownership of the contract to a new owner                                                                                                                  |
| accept-ownership \<address>                                                               | Accepts the pending owner                                                                                                                                               |
| collect-erc20 \<address> \<token> \<amount> \<recipient>                                  | collects ERC20 tokens from vault contract balance to the recipient                                                                                                      |

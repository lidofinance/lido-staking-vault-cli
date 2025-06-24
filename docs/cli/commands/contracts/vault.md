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

| Command                                    | Description                                                           |
| ------------------------------------------ | --------------------------------------------------------------------- |
| info \<address>                            | get vault base info                                                   |
| DEPOSIT_CONTRACT \<address>                | get vault deposit contract                                            |
| is-paused-deposits \<address>              | get whether deposits are paused by the vault owner                    |
| validator-w-fee \<address> \<numberOfKeys> | get calculated withdrawal fee for a validator                         |
| depositor \<address>                       | get the address of the depositor                                      |
| getInitializedVersion \<address>           | Calls the read-only function "getInitializedVersion" on the contract. |
| isOssified \<address>                      | Calls the read-only function "isOssified" on the contract.            |
| no \<address>                              | get vault node operator                                               |
| owner \<address>                           | get vault owner                                                       |
| pendingOwner \<address>                    | Calls the read-only function "pendingOwner" on the contract.          |
| version \<address>                         | get vault version                                                     |
| wc \<address>                              | get vault withdrawal credentials                                      |

### Write

| Command                                                                                   | Description                                             |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| fund                                                                                      | fund vault                                              |
| withdraw \<address> \<recipient> \<eth>                                                   | withdraw from vault                                     |
| no-deposit-beacon \<address> \<amountOfDeposit> \<pubkey> \<signature> \<depositDataRoot> | deposit to beacon chain                                 |
| no-val-exit \<address> \<validatorPublicKey>                                              | request to exit validator                               |
| bc-resume \<address>                                                                      | Resumes deposits to beacon chain                        |
| bc-pause \<address>                                                                       | Pauses deposits to beacon chain                         |
| trigger-v-w \<address> \<pubkeys> \<amounts> \<refundRecipient>                           | Trigger validator withdrawal                            |
| eject-validators \<address> \<pubkeys> \<refundRecipient>                                 | triggers EIP-7002 validator exits by the node operator. |
| ossify \<address>                                                                         | Ossifies the staking vault.                             |
| set-depositor \<address> \<depositor>                                                     | Sets the depositor                                      |
| transfer-ownership \<address> \<newOwner>                                                 | Transfers the ownership of the contract to a new owner  |
| accept-ownership \<address>                                                               | Accepts the pending owner                               |

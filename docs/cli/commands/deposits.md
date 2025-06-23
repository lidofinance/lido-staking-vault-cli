---
sidebar_position: 3
---

# Deposits

## Command

```bash
yarn start deposits [arguments] [-options]
```

## Deposits commands list

```bash
yarn start deposits -h
```

## API

| Command   | Description    |
| --------- | -------------- |
| read (r)  | read commands  |
| write (w) | write commands |

### Read

| Command | Description |
| ------- | ----------- |

### Write

| Command                                  | Description                                                                                       |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------- |
| predeposit \<deposits>                   | deposits NO's validators with PREDEPOSIT_AMOUNT ether from StakingVault and locks up NO's balance |
| proof-and-prove prove                    | make proof and prove                                                                              |
| prove-and-deposit \<indexes> \<deposits> | shortcut for the node operator: prove, top up and deposit to proven validators                    |
| deposit-to-beacon-chain \<deposits>      | deposits ether to proven validators from staking vault                                            |
| top-up \<amount>                         | top up no balance                                                                                 |
| withdraw-no-balance \<amount>            | withdraw node operator balance                                                                    |
| set-no-guarantor set-no-g                | set node operator guarantor                                                                       |

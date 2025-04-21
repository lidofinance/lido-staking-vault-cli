---
sidebar_position: 8
---

# PredepositGuarantee Helpers

## Command

```bash
lsv-cli pdg-helpers [arguments] [-options]
```

## PDG helpers commands list

```bash
lsv-cli pdg-helpers -h
```

## API

| Command                                                                                             | Description                                                           |
| --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| proof-and-check proof-check                                                                         | create predeposit proof by validator index and check by test contract |
| proof                                                                                               | create predeposit proof by validator index                            |
| fv-gindex \<forks>                                                                                  | get first validator gindex                                            |
| compute-deposit-data-root compute-dd-root\<pubkey> \<withdrawal-credentials> \<signature> \<amount> | compute deposit data root                                             |

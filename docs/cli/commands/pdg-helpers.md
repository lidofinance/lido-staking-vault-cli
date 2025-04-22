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

| Command                                                                                             | Description                                                         |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| proof-and-check proof-check                                                                         | make predeposit proof by validator index and check by test contract |
| proof                                                                                               | make predeposit proof by validator index                            |
| verify-predeposit-bls verify-bls\<deposits>                                                         | Verifies BLS signature of the deposit                               |
| fv-gindex \<forks>                                                                                  | get first validator gindex                                          |
| compute-deposit-data-root compute-dd-root\<pubkey> \<withdrawal-credentials> \<signature> \<amount> | compute deposit data root                                           |
| compute-deposit-domain compute-d-domain\<forkVersion>                                               | compute deposit domain                                              |

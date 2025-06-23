---
sidebar_position: 6
---

# PredepositGuarantee Helpers

## Command

```bash
yarn start pdg-helpers [arguments] [-options]
```

## PDG helpers commands list

```bash
yarn start pdg-helpers -h
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

**\<deposits>**

```json
[{
  "pubkey": "...",
  "signature": "...",
  "amount": number,
  "deposit_data_root": "..."
}]
```

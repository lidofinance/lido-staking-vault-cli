---
sidebar_position: 3
---

# VaultFactory

## Command

```bash
lsv-cli factory [arguments] [-options]
```

## VaultFactory commands list

```bash
lsv-cli factory -h
```

## API

| Command                                                                                                                                 | Description                                                     |
| --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| constants                                                                                                                               | get vault factory constants info                                |
| BEACON                                                                                                                                  | Calls the read-only function "BEACON" on the contract.          |
| DELEGATION_IMPL                                                                                                                         | Calls the read-only function "DELEGATION_IMPL" on the contract. |
| create-vault \<defaultAdmin> \<nodeOperatorManager> \<assetRecoverer> \<confirmExpiry> \<curatorFeeBP> \<nodeOperatorFeeBP> \<quantity> | create vault contract                                           |

Note: \[quantity] is optional argument, default 1
**[options]**

| Option                                                               | Description                                  |
| -------------------------------------------------------------------- | -------------------------------------------- |
| -f, --funders \<funders>                                             | funders role address                         |
| -w, --withdrawers \<withdrawers>                                     | withdrawers role address                     |
| -m, --minters \<minters>                                             | minters role address                         |
| -b, --burners \<burners>                                             | burners role address                         |
| -r, --rebalancers \<rebalancers>                                     | rebalancers role address                     |
| -p, --depositPausers \<depositPausers>                               | depositPausers role address                  |
| -d, --depositResumers \<depositResumers>                             | depositResumers role address                 |
| -e, --exitRequesters \<exitRequesters>                               | exitRequesters role address                  |
| -u, --disconnecters \<disconnecters>                                 | disconnecters role address                   |
| -c, --curators \<curators>                                           | curators address                             |
| -ve --validatorExitRequesters \<validatorExitRequesters>             | validator exit requesters role addresses     |
| -vt --validatorWithdrawalTriggerers \<validatorWithdrawalTriggerers> | validator withdrawal triggerers role address |
| -o, --nodeOperatorFeeClaimer \<nodeOperatorFeeClaimer>               | node operator fee claimer address            |
| -cfs --curatorFeeSetters \<curatorFeeSetters>                        | curator fee setters role addresses           |
| -cfc --curatorFeeClaimers \<curatorFeeClaimers>                      | curator fee claimers role addresses          |
| -nofc --nodeOperatorFeeClaimers \<nodeOperatorFeeClaimers>           | node operator fee claimers role addresses    |

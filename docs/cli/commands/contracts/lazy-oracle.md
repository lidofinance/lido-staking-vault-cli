---
sidebar_position: 8
---

# LazyOracle

## Command

```bash
yarn start contracts lazy-oracle [arguments] [-options]
```

## LazyOracle commands list

```bash
yarn start contracts lazy-oracle -h
```

## API

| Command  | Description   |
| -------- | ------------- |
| read (r) | read commands |

### Read

| Command                              | Description                                    |
| ------------------------------------ | ---------------------------------------------- |
| info                                 | get lazy oracle base info                      |
| batch-vaults-info \<offset> \<limit> | get batch vaults info                          |
| latest-report-data lrd               | get latest report data                         |
| latest-report-timestamp lrt          | get latest report timestamp                    |
| max-lido-fee-rate-per-second max-lfs | get the max Lido fee rate per second, in ether |
| max-reward-ratio-bp mrr              | get max reward ratio                           |
| quarantine-period qp                 | get quarantine period                          |
| vault-quarantine vq\<vault>          | get vault quarantine                           |
| vaults-count vc                      | get vaults count                               |

---
sidebar_position: 2
---

# Report

## Command

```bash
yarn start report [arguments] [-options]
```

## Report commands list

```bash
yarn start report -h
```

## API

### Read

| Command                | Description                |
| ---------------------- | -------------------------- |
| latest-report-data lrd | get the latest report data |
| by-vault               | get report by vault        |
| proof-by-vault         | get proof by vault         |
| all                    | get all reports            |
| check-cid              | check ipfs CID             |

### Write

| Command                    | Description                  |
| -------------------------- | ---------------------------- |
| by-vault-submit submit     | submit report by vault       |
| by-vaults-submit \<vaults> | submit report for vaults     |
| submit-all                 | submit report for all vaults |

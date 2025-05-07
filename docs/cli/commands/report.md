---
sidebar_position: 10
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

| Command                 | Description         |
| ----------------------- | ------------------- |
| by-vault \<vault>       | get report by vault |
| proof-by-vault \<vault> | get proof by vault  |
| all                     | get all reports     |
| check-cid               | check ipfs CID      |
| make-leaf \<vault>      | make leaf           |

### Write

| Command                        | Description                  |
| ------------------------------ | ---------------------------- |
| by-vault-submit submit\<vault> | submit report by vault       |
| by-vaults-submit \<vaults>     | submit report for vaults     |
| submit-all                     | submit report for all vaults |

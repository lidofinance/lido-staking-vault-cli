---
sidebar_position: 1
---

# Account

## Command

```bash
yarn start account [arguments] [-options]
```

## Account commands list

```bash
yarn start account -h
```

## API

| Command                                                              | Description                                                                         |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| info                                                                 | general account info.                                                               |
| generate-key                                                         | generate a new key. Disclaimer: this command is not recommended for production use. |
| steth-allowance \<address> \<amount>                                 | set allowance for steth contract                                                    |
| steth-allowance-populate-tx steth-allowance-tx\<address> \<amount>   | populate tx for steth allowance                                                     |
| get-steth-allowance \<address>                                       | get steth allowance for an address                                                  |
| wsteth-allowance \<address> \<amount>                                | set allowance for wsteth contract                                                   |
| wsteth-allowance-populate-tx wsteth-allowance-tx\<address> \<amount> | populate tx for wsteth allowance                                                    |
| get-wsteth-allowance \<address>                                      | get wsteth allowance for an address                                                 |

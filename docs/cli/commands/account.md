---
sidebar_position: 2
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

| Command   | Description    |
| --------- | -------------- |
| read (r)  | read commands  |
| write (w) | write commands |

### Read

| Command                                                              | Description                         |
| -------------------------------------------------------------------- | ----------------------------------- |
| info \<address>                                                      | general account info.               |
| steth-allowance-populate-tx steth-allowance-tx\<address> \<amount>   | populate tx for steth allowance     |
| get-steth-allowance \<address>                                       | get steth allowance for an address  |
| wsteth-allowance-populate-tx wsteth-allowance-tx\<address> \<amount> | populate tx for wsteth allowance    |
| get-wsteth-allowance \<address>                                      | get wsteth allowance for an address |

### Write

| Command                                | Description                                                                         |
| -------------------------------------- | ----------------------------------------------------------------------------------- |
| generate-key                           | generate a new key. Disclaimer: this command is not recommended for production use. |
| generate-encrypted-account \<password> | generate a new encrypted account                                                    |
| steth-allowance \<address> \<amount>   | set allowance for steth contract                                                    |
| wsteth-allowance \<address> \<amount>  | set allowance for wsteth contract                                                   |

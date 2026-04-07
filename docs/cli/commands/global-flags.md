---
sidebar_position: 1
title: Global Flags
---

# Global Flags

These flags are available on **every** CLI command unless noted otherwise.

## `--json`

Output command results as machine-readable JSON instead of the default human-readable format.

```bash
yarn start vo r info --json
yarn start deposits r no-balance --json
yarn start report r latest-report-data --json
```

Useful for scripting, piping into `jq`, or integrating with other tools.

## `--populate-tx`

Generate a raw unsigned transaction object instead of sending it. The output can be inspected, signed externally, or broadcast via another tool.

```bash
yarn start vo w fund 32 --populate-tx
yarn start report w by-vault-submit --populate-tx
```

Use this when you want to review the exact calldata before broadcasting, or when working in an air-gapped environment.

## `-y, --yes`

Skip all confirmation prompts and proceed automatically. Useful for non-interactive scripts and CI pipelines.

```bash
yarn start report w submit-all --yes
yarn start deposits w top-up-no 1 -v 0x... --yes
```

:::warning
Use with caution — all confirmations are bypassed, including destructive operations.
:::

## `--wallet-connect`

Use WalletConnect to sign and send transactions from an external wallet (mobile app or Safe) instead of a local private key.

```bash
yarn start vo w fund 32 --wallet-connect
yarn start consolidation w consolidate 0x... --file config.json --batch --wallet-connect
```

Requires `WALLET_CONNECT_PROJECT_ID` to be set in `.env`. See the [WalletConnect Guide](../get-started/wallet-connect.md) for setup details.

## `--csv <file>`

Write table output to a CSV file. Available on commands that produce tabular data (primarily `metrics` commands).

```bash
yarn start metrics r statistic-by-reports 24 -v 0x... --csv ./stats.csv
yarn start metrics r report-data 10 -v 0x... --csv ./raw-data.csv
```

Notes:

- Headers are included when present (e.g., timestamps in `statistic-by-reports`)
- Large integer values are serialized as strings to preserve precision

## `-h, --help`

Display help for any command or subcommand.

```bash
yarn start -h
yarn start vo -h
yarn start vo w -h
yarn start deposits r -h
```

## `--no-cache-use`

Disable caching for data fetched from IPFS. By default the CLI caches IPFS responses to speed up repeated requests; use this flag to always fetch fresh data.

```bash
yarn start report r by-vault --no-cache-use
yarn start metrics r statistic -v 0x... --no-cache-use
```

## `--version`

Output the current CLI version and exit. Only available on the root command (`yarn start`), not on subcommands.

```bash
yarn start --version
```

## Combining Flags

Flags can be combined freely:

```bash
# Fund vault via WalletConnect, skip confirmation, output JSON
yarn start vo w fund 32 -v 0x... --wallet-connect --yes --json

# Generate raw tx without sending
yarn start deposits w predeposit '[{...}]' --populate-tx --json
```

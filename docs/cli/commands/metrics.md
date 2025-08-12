---
sidebar_position: 4
---

# Metrics

## Command

```bash
yarn start metrics [arguments] [-options]
```

## Metrics commands list

```bash
yarn start metrics -h
```

## Overview

Metrics commands provide comprehensive analytics and reporting for Lido Staking Vaults, including APR calculations, rewards tracking, and visual chart generation for performance analysis.

## API

| Command  | Description   |
| -------- | ------------- |
| read (r) | read commands |

### Read

| Command                      | Description                                |
| ---------------------------- | ------------------------------------------ |
| statistic                    | get statistic data for last report         |
| statistic-by-reports <count> | get statistic data for N last reports      |
| report-data <count>          | get report data for Vault from N reports   |
| charts-apr <count>           | get APR charts data for N last reports     |
| charts-rewards <count>       | get rewards charts data for N last reports |

### Write

Currently no write commands are implemented for metrics.

## Command Details

### statistic

Analyzes the latest vault report and calculates comprehensive performance metrics and statistics.

**Options:**

- `-v, --vault <string>`: Vault address
- `-g, --gateway`: IPFS gateway URL for report data retrieval

**Process:**

- Retrieves latest report data from LazyOracle contract
- Fetches current and previous vault reports from IPFS
- Calculates comprehensive performance metrics
- Displays statistical analysis

**Metrics Calculated:**

- **Gross Staking Rewards**: Total rewards earned from staking
- **Node Operator Rewards**: Rewards allocated to node operators
- **Daily Lido Fees**: Protocol fees paid to Lido
- **Net Staking Rewards**: Rewards after fees and expenses
- **Gross Staking APR**: Annual percentage return before fees
- **Net Staking APR**: Annual percentage return after fees
- **Carry Spread**: Final stVault bottom line in %
- **Bottom Line**: Final profit/loss after all adjustments

**Use Case:** Get comprehensive performance overview for a specific reporting period.

### statistic-by-reports

Analyzes multiple historical vault reports and calculates comprehensive performance metrics for N last reports.

**Arguments:**

- `<count>`: Number of historical reports to analyze

**Options:**

- `-v, --vault <string>`: Vault address
- `-g, --gateway`: IPFS gateway URL for report data retrieval

**Process:**

- Retrieves historical report data from LazyOracle contract
- Fetches vault reports from IPFS for the specified count
- Calculates performance metrics for each reporting period
- Displays data in tabular format with timestamps

**Metrics Calculated:**

- **Gross Staking Rewards**: Total rewards earned from staking
- **Node Operator Rewards**: Rewards allocated to node operators
- **Net Staking Rewards**: Rewards after fees
- **Gross Staking APR**: Annual percentage return before fees
- **Net Staking APR**: Annual percentage return after fees
- **Carry Spread**: Final stVault bottom line in %
- **Bottom Line**: Final profit/loss after all adjustments

**Use Case:** Compare performance metrics across multiple reporting periods and identify trends over time.

### report-data

Retrieves raw report data for the vault from N last reports.

**Arguments:**

- `<count>`: Number of historical reports to include

**Options:**

- `-v, --vault <string>`: Vault address
- `-g, --gateway`: IPFS gateway URL for report data retrieval

**Output (tabular):**

Header row contains `Metric` and corresponding timestamps. Rows include:

- `Vault Address`
- `Total Value, WEI`
- `Fee, WEI`
- `Liability Shares, WEI`
- `Slashing Reserve, WEI`
- `In/Out Delta, WEI`
- `Prev Fee, WEI`
- `Infra Fee, WEI`
- `Liquidity Fee, WEI`
- `Reservation Fee, WEI`

**Use Case:** Export vault’s raw on-report values for further analysis and reconciliation.

### charts-apr

Generates visual APR (Annual Percentage Rate) charts for historical vault performance analysis.

**Arguments:**

- `<count>`: Number of historical reports to include

**Options:**

- `-v, --vault <string>`: Vault address
- `-s, --simplified`: Use simplified text-based charts instead of interactive charts

**Chart Types:**

- **Gross Staking APR**: Raw staking performance over time
- **Net Staking APR**: Performance after node operator fees
- **Carry Spread**: Final stVault bottom line in %
- **Bottom Line**: Net profit/loss trend
- **Lido APR**: Comparative Lido protocol performance

**Process:**

- Retrieves historical report data from IPFS
- Calculates time-series APR metrics
- Renders interactive charts using blessed-contrib library
- Displays comparative performance analysis

**Use Case:** Analyze vault performance trends and identify optimization opportunities.

### charts-rewards

Displays visual charts focused on rewards distribution and flow analysis.

**Arguments:**

- `<count>`: Number of historical reports to analyze

**Options:**

- `-v, --vault <string>`: Vault address

**Chart Types:**

- **Gross Staking Rewards**: Total rewards generated over time
- **Node Operator Rewards**: Operator compensation tracking
- **Net Staking Rewards**: Final rewards after all deductions

**Process:**

- Fetches historical vault reports and fee configurations
- Calculates rewards metrics for each reporting period
- Generates interactive reward flow visualizations
- Shows rewards distribution patterns

**Use Case:** Monitor rewards flow and operator compensation over time.

## Exporting Metrics to CSV

Any table output produced by metrics commands can be exported to a CSV file using global flags.

**Flags:**

- `--csv <file>`: write table output to a CSV file

**Examples:**

Export statistics for last 24 reports:

```bash
yarn start metrics read statistic-by-reports 24 --vault <address> --csv ./stats.csv
```

Notes:

- Headers are included when present (e.g., timestamps in `statistic-by-reports` and `report-data`).
- Big integer values are serialized as strings.

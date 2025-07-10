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

| Command                       | Description                                |
| ----------------------------- | ------------------------------------------ |
| statistic                     | get statistic data for last report         |
| statistic-by-reports \<count> | get statistic data for N last reports      |
| charts-apr \<count>           | get APR charts data for N last reports     |
| charts-rewards \<count>       | get rewards charts data for N last reports |

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

## Data Sources

### IPFS Integration

- **Report Storage**: Historical data stored on IPFS
- **Decentralized Access**: Multiple gateway support
- **Data Integrity**: Content-addressed storage verification
- **Caching**: Local caching for performance optimization

### Oracle Data

- **LazyOracle**: Latest report metadata
- **Block-based Queries**: Historical contract state access
- **Fee Rate Tracking**: Node operator fee history
- **Share Rate Data**: stETH share rates

## Performance Optimization

### Caching Strategy

- **Report Data**: Local storage of IPFS content
- **Fee Rates**: Cached node operator fees by block
- **Share Rates**: Cached stETH share rates
- **Gateway Failover**: Multiple IPFS gateway support

## Use Cases

### Vault Management

- Monitor long-term performance trends
- Identify optimization opportunities
- Track stVault carry spread
- Analyze fee impact

### Reporting & Analysis

- Generate performance reports
- Compare vault performance
- Analyze rewards distribution
- Monitor carry spread metrics

### Development & Testing

- Validate metric calculations
- Test chart rendering
- Debug performance issues
- Analyze historical data patterns

---
sidebar_position: 3
---

# Metrics Calculation Reference

This page documents the formulas and methodology used to compute vault performance metrics. All metrics are derived from oracle reports stored on IPFS and from on-chain contract state.

## Data Sources

Each oracle report is stored on IPFS and contains the following fields per reporting period:

| Field             | Description                                                                         |
| ----------------- | ----------------------------------------------------------------------------------- |
| `totalValueWei`   | Total ETH value held by the vault at report time                                    |
| `inOutDelta`      | Cumulative net ETH flow into the vault (deposits minus withdrawals)                 |
| `fee`             | Cumulative Lido protocol fee balance attributed to the vault                        |
| `liabilityShares` | Number of stETH liability shares the vault holds (minted stETH backed by vault ETH) |

On-chain values read at the oracle report block:

| Value           | Source contract   | Description                                               |
| --------------- | ----------------- | --------------------------------------------------------- |
| `settledGrowth` | `NodeOperatorFee` | Cumulative vault growth that has been settled with the NO |
| `feeRate`       | `NodeOperatorFee` | Node operator fee rate in basis points (e.g. 1000 = 10%)  |
| `shareRate`     | `stETH`           | Current stETH share rate (ETH per share, scaled by 1e27)  |

---

## Gross Staking Rewards

The gross staking reward for a given period is the increase in total vault value, excluding any ETH inflows or outflows:

```
grossStakingRewards = (totalValueCurr − totalValuePrev)
                    − (inOutDeltaCurr − inOutDeltaPrev)
```

`inOutDelta` is a cumulative counter, so its delta isolates the organic ETH growth from staking vs. new deposits or withdrawals.

:::note
**Currently, any ETH change not captured in `inOutDelta` is treated as staking rewards.** This means that slashing penalties, unexpected value changes, or other vault-level ETH movements are included in `grossStakingRewards` rather than tracked separately.
:::

---

## Daily Lido Fees

The Lido protocol charges fees (infrastructure, liquidity, reservation) on each report. These are tracked as a running cumulative sum in the `fee` field:

```
dailyLidoFees = feeCurr − feePrev
```

This delta equals `infraFee + liquidityFee + reservationFee` for the reporting period.

---

## Node Operator Fee

The node operator (NO) fee is the share of vault growth paid to the vault's node operator. The fee accumulates continuously between oracle reports, and the NO may claim (settle) it at any time. To compute the correct fee for a period regardless of when claims occurred, the CLI uses a **noEarnings** auxiliary function:

```
noEarnings(T) = settledGrowth(T) × feeRate / 10000 + accruedFee(T)
```

The period fee is:

```
nodeOperatorFee = noEarnings(curr) − noEarnings(prev)
```

The `noEarnings` function is claim-timing invariant: whether the NO claims fees zero times or ten times during a period, `Δ(noEarnings)` equals the true fee accrued on gross staking rewards.

### Off-chain accruedFee

`accruedFee` is computed off-chain from IPFS data to avoid stale on-chain state (the on-chain value is only updated when the vault owner calls `updateVaultData`):

```
growth          = totalValueWei − inOutDelta
unsettledGrowth = growth − settledGrowth
accruedFee      = max(0, unsettledGrowth × feeRate / 10000)
```

The IPFS `totalValueWei` is the oracle-observed value **before** the LazyOracle applies any quarantine deduction to VaultHub. This means `totalValueWei = VaultHub.totalValue + quarantineValue`, so the off-chain formula above is mathematically equivalent to the on-chain `accruedFee()` calculation — no separate `quarantineValue` term is needed.

---

## Net Staking Rewards

Net staking rewards are what remains after deducting the node operator fee and Lido protocol fees:

```
netStakingRewards = grossStakingRewards − nodeOperatorFee − dailyLidoFees
```

---

## stETH Liability Rebase Adjustment

When a vault mints stETH, it takes on stETH liability shares. As the stETH share rate rises over time (from Lido staking rewards), the ETH value of those liabilities grows. This growth represents an increase in the vault's stETH adjustments:

```
stEthLiabilityRebaseCost = liabilitySharesPrev × (shareRateCurr − shareRatePrev) / 1e27
```

**Why opening shares (`liabilitySharesPrev`) only?**

Using the opening share count mirrors the simple-return convention used by Lido Core APR formula:

```
lidoAPR = (shareRateCurr − shareRatePrev) / shareRatePrev × annualization
```

Both formulas denominate against the value at the _start_ of the period. Shares minted mid-period are treated as arriving at the beginning of the _next_ period — their rebase adjustment is deferred one period. This keeps vault metrics directly comparable to Lido Core APR figures.

A practical consequence: in the first report period after a large stETH mint, `liabilitySharesPrev = 0` and the rebase adjustment is zero for that one period. The full adjustment is recognized in the following period once those shares become `liabilitySharesPrev`.

---

## Bottom Line

Bottom Line is the vault's net P&L after accounting for the stETH liability rebase adjustment:

```
bottomLine = netStakingRewards − stEthLiabilityRebaseCost
```

A positive bottom line means the vault earned more from staking than it paid in fees and stETH liability growth. A negative value occurs when stETH liabilities grow faster than staking earnings — common during the period when new validators are in the activation queue.

Another applicable use of this metric is tracking the Health Factor trend: a positive bottom line increases the Health Factor, while a negative bottom line decreases it.

---

## APR Metrics

All three APR metrics follow the same annualization formula, differing only in the numerator:

```
APR (%) = (numerator × 100 × 31536000) / (previousTVL × periodSeconds)
```

| Metric            | Numerator             |
| ----------------- | --------------------- |
| Gross Staking APR | `grossStakingRewards` |
| Net Staking APR   | `netStakingRewards`   |
| Carry Spread      | `bottomLine`          |

Where:

- `previousTVL` = `totalValueWei` from the **previous** (opening) report
- `periodSeconds` = `timestampCurr − timestampPrev`
- `31536000` = seconds per year (365 days)

### Denominator: opening TVL

Using the opening TVL (`previousTVL`) is consistent with how Lido Core APR is calculated:

```
lidoCoreAPR  = ΔshareRate / preShareRate  × annualization   (Lido Core methodology)
vaultAPR = rewards    / previousTVL   × annualization   (this stVaults CLI methodology)
```

Both use the value at the _start_ of the period as the denominator, following the standard simple-return convention. This makes vault APR figures directly comparable to the Lido APR shown in the `charts-apr` output.

### Transition period behavior

In reporting periods where a large ETH deposit arrives mid-period, `previousTVL` reflects the pre-deposit vault size while rewards may partly benefit from the new capital. This produces a one-period spike or dip in APR metrics. This is expected behavior under a simple-return methodology and is consistent with how Lido APR handles intra-period stETH minting events.

---

## Lido APR

The CLI also reports the Lido Core Gross APR for each period as a reference benchmark:

```
lidoCoreAPR = (postShareRate − preShareRate) / preShareRate × (31536000 / periodSeconds) × 100
```

`preShareRate` and `postShareRate` are the stETH share rates at the start and end of the reporting period. This value is drawn directly from the oracle report data and represents the stETH yield that all stETH holders received during the period.

---

## Summary Table

| Metric                            | Formula                                                                          |
| --------------------------------- | -------------------------------------------------------------------------------- |
| Gross Staking Rewards             | `ΔtotalValue − ΔinOutDelta`                                                      |
| Daily Lido Fees                   | `Δfee`                                                                           |
| Node Operator Fee                 | `Δ(settledGrowth × feeRate/10000 + accruedFee)`                                  |
| Net Staking Rewards               | `grossStakingRewards − nodeOperatorFee − dailyLidoFees`                          |
| stETH Liability Rebase Adjustment | `liabilitySharesPrev × ΔshareRate / 1e27`                                        |
| Bottom Line                       | `netStakingRewards − stEthLiabilityRebaseCost`                                   |
| Gross Staking APR (%)             | `grossStakingRewards × 100 × 31536000 / (previousTVL × periodSeconds)`           |
| Net Staking APR (%)               | `netStakingRewards × 100 × 31536000 / (previousTVL × periodSeconds)`             |
| Carry Spread (%)                  | `bottomLine × 100 × 31536000 / (previousTVL × periodSeconds)`                    |
| Lido Core APR (%)                 | `(postShareRate − preShareRate) / preShareRate × 31536000 / periodSeconds × 100` |

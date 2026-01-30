---
sidebar_position: 4
---

# Health Monitoring

## Command

```bash
yarn start dw uc h [command] [arguments] [options]
# or
yarn start defi-wrapper use-cases health [command] [arguments] [options]
```

## Health commands list

```bash
yarn start dw uc h -h
```

## Overview

Health monitoring commands track and manage unhealthy user positions in STV-stETH pools. These commands help identify positions that exceed the forced rebalance threshold and require intervention to maintain pool stability.

The health check system works by:

- Indexing user STV balances and stETH share debt from blockchain events
- Pricing positions using current exchange rates
- Comparing debt-to-collateral ratios against configured thresholds
- Providing tools to rebalance unhealthy positions

## API

| Command   | Description    |
| --------- | -------------- |
| read (r)  | read commands  |
| write (w) | write commands |

### Read

| Command                  | Description                                                     |
| ------------------------ | --------------------------------------------------------------- |
| list-unhealthy           | list all unhealthy positions in the pool                        |
| calculate-rebalance-need | calculate total ETH needed to rebalance all unhealthy positions |

### Write

| Command                            | Description                                                                                     |
| ---------------------------------- | ----------------------------------------------------------------------------------------------- |
| force-rebalance                    | force rebalance an unhealthy position (collateralized only)                                     |
| force-rebalance-and-socialize-loss | force rebalance an undercollateralized position with loss socialization (requires special role) |

## Command Details

### list-unhealthy

Lists all unhealthy positions in the STV-stETH pool, showing accounts that have exceeded the forced rebalance threshold.

**Arguments:**

- `<address>`: STV-stETH pool contract address

**Options:**

- `--from-block <number>`: Starting block for event indexing (default: latest - 50000)
- `--to-block <number>`: Ending block for event indexing (default: latest)
- `--batch-size <number>`: Maximum blocks per RPC call when fetching events (default: 30000)
- `--verbose`: Show detailed calculation logs for debugging

**Output (Table Format):**

- **Account**: User address
- **STV Balance**: User's STV token balance (27 decimals)
- **Debt (shares)**: User's stETH share debt
- **Debt (ETH)**: Debt value priced in ETH
- **LTV Ratio**: Loan-to-Value ratio as percentage
- **Over Threshold**: How much the position exceeds the threshold
- **Status**: 🚨 CRITICAL (>10% over) or ⚠️ UNHEALTHY

**Example:**

```bash
# List unhealthy positions
yarn start dw uc h r list-unhealthy 0xd73e9e221db579d67f676bfc8d4192af35a1ba06

# With verbose output for debugging
yarn start dw uc h r list-unhealthy 0xd73e9e221db579d67f676bfc8d4192af35a1ba06 --verbose

# Scan specific block range
yarn start dw uc h r list-unhealthy 0xd73e9e221db579d67f676bfc8d4192af35a1ba06 \
  --from-block 1700000 --to-block 1750000
```

**Technical Details:**

Position health is determined using the same logic as the contract's `_isThresholdBreached` function:

```solidity
assetsThreshold = Math.mulDiv(
    getPooledEthBySharesRoundUp(stethShares),
    TOTAL_BASIS_POINTS,
    TOTAL_BASIS_POINTS - forcedRebalanceThresholdBP,
    Math.Rounding.Ceil
);
isUnhealthy = assets < assetsThreshold;
```

The CLI replicates this exact calculation including ceiling rounding to ensure consistency with on-chain health checks.

### calculate-rebalance-need

Calculates the total ETH required to rebalance all unhealthy positions, accounting for available exceeding minted stETH and current vault balance.

**Arguments:**

- `<address>`: STV-stETH pool contract address

**Options:**

- `--from-block <number>`: Starting block for event indexing
- `--batch-size <number>`: Maximum blocks per RPC call (default: 30000)
- `--verbose`: Show detailed breakdown by account

**Output:**

1. **Total stETH Required (raw)**: Sum of `previewForceRebalance()` results for all unhealthy positions
2. **Exceeding Minted stETH (available)**: Amount from `totalExceedingMintedSteth()` that can be used without external ETH
3. **After Exceeding Adjustment**: Real ETH need after subtracting exceeding stETH
4. **Vault ETH Balance**: Current vault ETH balance via `publicClient.getBalance()`
5. **ETH Shortfall**: Additional ETH needed beyond vault balance (if any)

**Example:**

```bash
# Calculate rebalance requirements
yarn start dw uc h r calculate-rebalance-need 0xd73e9e221db579d67f676bfc8d4192af35a1ba06

# With detailed breakdown per account
yarn start dw uc h r calculate-rebalance-need 0xd73e9e221db579d67f676bfc8d4192af35a1ba06 --verbose
```

**Understanding "After Exceeding Adjustment":**

The pool may have "exceeding minted stETH" - this is stETH already available in the pool that can be used for rebalancing WITHOUT requiring external ETH deposits. The calculation flow:

```
Total stETH Required:        10.0 ETH
- Exceeding stETH Available: -3.0 ETH
= Real ETH Need:              7.0 ETH
- Vault Balance:             -5.0 ETH
= ETH Shortfall:              2.0 ETH (need to deposit)
```

If "After Exceeding Adjustment" is 0, it means exceeding stETH fully covers all rebalance needs!

**Action Items:**

The command provides specific next steps based on the analysis:

- If ETH shortfall > 0: Command to deposit ETH to vault
- If vault balance sufficient: Confirmation message
- List of accounts requiring rebalance
- Special warning for undercollateralized positions requiring loss socialization

### force-rebalance

Executes a force rebalance operation for a single unhealthy position. This command burns user's STV tokens and unlocks their stETH share debt.

**Arguments:**

- `<address>`: STV-stETH pool contract address
- `<account>`: User account address to rebalance

**Options:**

- `--dry-run`: Preview the operation without executing the transaction

**Process:**

1. Checks if position is unhealthy via `isHealthyOf()`
2. Calls `previewForceRebalance()` to get expected outcomes
3. Verifies position is NOT undercollateralized
4. Displays preview with STV to burn and stETH to unlock
5. Requests user confirmation
6. Executes `forceRebalance(account)` transaction

**Example:**

```bash
# Preview rebalance
yarn start dw uc h w force-rebalance \
  0xd73e9e221db579d67f676bfc8d4192af35a1ba06 \
  0x1234567890123456789012345678901234567890 \
  --dry-run

# Execute rebalance
yarn start dw uc h w force-rebalance \
  0xd73e9e221db579d67f676bfc8d4192af35a1ba06 \
  0x1234567890123456789012345678901234567890
```

**Requirements:**

- Position must be unhealthy (`isHealthyOf() == false`)
- Position must be collateralized (debt < collateral value)
- Account must have STV balance > 0

**Validation:**

The command will abort with clear error messages if:

- ✅ Position is healthy - no rebalance needed
- ⚠️ Account has no STV balance
- ❌ Position is undercollateralized - use `force-rebalance-and-socialize-loss` instead

### force-rebalance-and-socialize-loss

Executes a force rebalance for an undercollateralized position, socializing losses across all pool participants. This is a critical operation that affects ALL users in the pool.

**Arguments:**

- `<address>`: STV-stETH pool contract address
- `<account>`: User account address to rebalance

**Options:**

- `--dry-run`: Preview the operation without executing

**Process:**

1. Checks caller has `LOSS_SOCIALIZER_ROLE`
2. Verifies position is unhealthy
3. Calls `previewForceRebalance()` and confirms undercollateralization
4. Calculates estimated loss to be socialized
5. Validates loss is within `maxLossSocializationBP` limits
6. Displays comprehensive preview including loss impact
7. Requires **double confirmation** from user
8. Executes `forceRebalanceAndSocializeLoss(account)` transaction

**Example:**

```bash
# Preview with loss calculation
yarn start dw uc h w force-rebalance-and-socialize-loss \
  0xd73e9e221db579d67f676bfc8d4192af35a1ba06 \
  0x1234567890123456789012345678901234567890 \
  --dry-run

# Execute (requires LOSS_SOCIALIZER_ROLE)
yarn start dw uc h w force-rebalance-and-socialize-loss \
  0xd73e9e221db579d67f676bfc8d4192af35a1ba06 \
  0x1234567890123456789012345678901234567890
```

**Requirements:**

- Caller must have `LOSS_SOCIALIZER_ROLE` on the pool contract
- Position must be unhealthy
- Position must be undercollateralized (debt > collateral value)
- Estimated loss must be within `maxLossSocializationBP` limit

**⚠️ CRITICAL WARNINGS:**

This operation is **irreversible** and has pool-wide impact:

- 🚨 Permanently burns user's STV tokens
- 🚨 Socializes losses across ALL pool participants
- 🚨 Reduces share rate for ALL users in the pool
- 🚨 Cannot be undone once executed

**Loss Calculation:**

```
STV Value (ETH):     5.0 ETH (from previewRedeem)
stETH Debt Value:    7.0 ETH (from getPooledEthBySharesRoundUp)
Estimated Loss:      2.0 ETH
Loss % of Supply:    0.05% (loss / totalSupply * 10000)
```

The loss percentage must be less than `maxLossSocializationBP` or the transaction will revert.

## Health Check Methodology

### Event-Based Balance Indexing

The health monitoring system calculates user balances by indexing blockchain events rather than querying current contract state. This ensures accuracy for positions that may have changed since the last block.

**Indexed Events:**

- **Transfer**: STV token movements
  - `from=0x0` → minting STV
  - `to=0x0` → burning STV
  - Standard transfers between addresses
- **StethSharesMinted**: Debt increases when users mint stETH against STV collateral
- **StethSharesBurned**: Debt decreases when debt is repaid

**Balance Calculation:**

```typescript
stvBalance = Σ(mints) - Σ(burns) + Σ(transfers in) - Σ(transfers out)
debtShares = Σ(StethSharesMinted) - Σ(StethSharesBurned)
```

### Pricing to ETH

Balances are converted to ETH using current exchange rates:

```typescript
stvInEth = previewRedeem(stvBalance); // STV → ETH
debtInEth = getPooledEthBySharesRoundUp(debtShares); // shares → ETH
```

Note: `getPooledEthBySharesRoundUp` is used (not the regular version) to ensure conservative debt valuation with ceiling rounding.

### Threshold Check

The health check replicates the contract's `_isThresholdBreached` function exactly:

```solidity
function _isThresholdBreached(uint256 _assets, uint256 _stethShares) internal view returns (bool) {
    if (_stethShares == 0) return false;

    uint256 assetsThreshold = Math.mulDiv(
        _getPooledEthBySharesRoundUp(_stethShares),
        TOTAL_BASIS_POINTS,
        TOTAL_BASIS_POINTS - forcedRebalanceThresholdBP(),
        Math.Rounding.Ceil
    );

    return _assets < assetsThreshold;
}
```

The CLI implementation uses precise BigInt arithmetic with ceiling rounding to ensure identical results.

## Typical Workflow

### Manual Rebalance Process

1. **Monitor**: Check for unhealthy positions

```bash
yarn start dw uc h r list-unhealthy <pool-address>
```

2. **Assess**: Calculate total ETH requirements

```bash
yarn start dw uc h r calculate-rebalance-need <pool-address> --verbose
```

3. **Fund** (if needed): Add ETH to vault if shortfall exists

```bash
yarn start dw stv-steth w rebalance-unassigned-liability-with-ether \
  <pool-address> <amount-in-eth>
```

4. **Execute**: Rebalance each position

```bash
# For collateralized positions
yarn start dw uc h w force-rebalance <pool-address> <account-address>

# For undercollateralized positions (requires LOSS_SOCIALIZER_ROLE)
yarn start dw uc h w force-rebalance-and-socialize-loss <pool-address> <account-address>
```

## Performance Optimization

### Event Caching

To avoid hitting RPC rate limits and improve performance, the system caches indexed events locally:

- Cache location: `cache/indexed-events-cache-<pool-address>.json`
- Automatic incremental updates for new blocks
- Configurable batch size via `--batch-size` option
- Default batch size: 30000 blocks per RPC call

**Benefits:**

- Fast repeated queries without re-fetching events
- Avoids RPC provider rate limits
- Enables historical analysis across large block ranges

### Best Practices

1. **Initial Sync**: First run may take longer as it builds the cache
2. **Regular Updates**: Run periodically to keep cache current
3. **Custom Range**: Use `--from-block` and `--to-block` for specific analysis
4. **Batch Size**: Adjust `--batch-size` based on your RPC provider limits
5. **Verbose Mode**: Use `--verbose` to verify calculations during testing

## Security Features

- **Contract-Accurate Calculations**: Exact replication of on-chain logic including rounding
- **Double Confirmation**: Loss socialization requires two confirmations
- **Role-Based Access**: Critical operations require `LOSS_SOCIALIZER_ROLE`
- **Preview Mode**: `--dry-run` allows safe preview without execution
- **Validation Checks**: Comprehensive pre-flight validation of all operations
- **Clear Warnings**: Prominent warnings for irreversible operations

## Error Handling

The system provides clear error messages for common scenarios:

- **No unhealthy positions**: All positions are healthy ✅
- **Position already healthy**: Account doesn't need rebalancing
- **Zero STV balance**: Cannot rebalance accounts with no STV
- **Missing role**: Caller lacks required `LOSS_SOCIALIZER_ROLE`
- **Undercollateralized**: Regular rebalance attempted on undercollateralized position
- **Exceeds loss limit**: Loss percentage exceeds `maxLossSocializationBP`
- **RPC rate limits**: Automatically handled via batch processing and caching

## Compliance with Technical Specification

✅ **Indexed balances**: Balances calculated from events as specified

✅ **Correct pricing**: Uses `previewRedeem()` for STV and `getPooledEthBySharesRoundUp()` for debt

✅ **Contract-accurate threshold**: Replicates `_isThresholdBreached()` with exact rounding

✅ **Exceeding stETH accounting**: Properly accounts for `totalExceedingMintedSteth()`

✅ **Full rebalance support**: Implements both `forceRebalance()` and `forceRebalanceAndSocializeLoss()`

## Troubleshooting

### Health Check Mismatch

If you see warnings like:

```
⚠️  MISMATCH: Contract isHealthy=true, our thresholdBreached=true
```

This indicates a discrepancy between CLI calculation and contract state. Possible causes:

- Use `--verbose` to see detailed calculation logs
- Verify you're using latest block range
- Check for recent transactions that may have changed state

### RPC Errors

If you encounter RPC errors about block ranges:

```
ranges over 10000 blocks are not supported on freetier
```

Solutions:

- Reduce `--batch-size` to a smaller value (e.g., 5000)
- Use a paid RPC provider with higher limits
- The caching system will automatically handle this in chunks

### No Events Found

If no positions are found but you expect some:

- Verify the pool address is correct
- Check the block range includes relevant activity
- Use `--from-block 0` to scan from deployment (slow)
- Verify you're on the correct network (HOODI testnet)

## Related Commands

- `yarn start dw stv-steth r get-pool-info`: Get pool configuration and metrics
- `yarn start dw stv-steth w rebalance-unassigned-liability-with-ether`: Add ETH to vault for rebalancing
- `yarn start dw stv-steth r get-user-position`: Check specific user position details

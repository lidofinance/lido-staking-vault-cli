All notable changes to this project will be documented in this file.

# 1.2.0

## CLI

### Added

#### DeFi Wrapper & Reporting

- Pool lifecycle enhancements: factories, pool creation/finalization, and richer pool info (including fresh report checks and stETH-specific details).
- Wrapper health monitoring commands and dev-tools integration; mainnet support with improved CLI logging.
- Updated ABIs with new error types/state mutability; vault record command and total value remainder logging in quarantine flow.

#### Consolidation Flow

- EOA and Safe consolidation paths with batching/no-batching options and optional auth list.
- Calldata fetching plus consolidation hash generator utilities; options for pubkeys/struct inputs.
- Stronger role validation, confirmations, async handling, and balance/fee prompts for validators.

#### Validators, Deposits, Metrics

- Awaited BLS validation and deposit checks for node operators and depositors.
- Cached node-operator accrued fee calculations; settledGrowth handling for no-rewards vaults.
- ETH-formatted/CSV metrics output; validator balance prompts for fee calculations; UI env write helper.

### Changed

- Consolidation logic streamlined and moved into features; improved validator checks and conditional logging.
- Report submission returns explicit boolean; confirm-expiry handling updated.
- Deposit validation simplified (removed redundant contract checks); share-limit commands rely on `stringToAddress`/`formatEther`.
- VaultViewer/VaultHub/LazyOracle ABIs refreshed; revokeDelegate uses `getCode`; factory/ABI setup DRY’d; repository/package metadata tweaks.

### Fixed

- Fee exemption handling and consolidation request validation (including no-consolidation cases).
- Validator totals converted to wei; awaited BLS validation; corrected extraValues/ABI references.
- JSON format checks and CL data fetch error handling; clearer confirmation variable naming.
- WalletConnect/Gnosis Safe edge cases with clearer failure logging; minor spinners/casts cleanup.

### Documentation

- Consolidation docs refreshed (fee exemption terminology, new commands, JSON format guidance) and new consolidation doc added.
- Wrapper documentation restructured with new commands/examples; reward adjustment wording switched to fee exemption.

### Chore

- Dependency bumps (actions/checkout, actions/setup-node, mdast-util-to-hast, node-forge), Docusaurus local search plugin, cache dirs in `.gitignore`.
- Wrapper v4 ABI updates; DRY’d factory and create ggv pool setups.

# 1.1.0

## CLI

### Added

#### DeFi Wrapper Integration

- Added complete DeFi Wrapper module support with new contracts and CLI commands:
  - `Factory` contract with pool creation and management operations
  - `Distributor` contract for reward distribution management
  - `StvPool` contract with deposit, withdrawal, and pool management
  - `StvStETHPool` contract with stETH-specific pool operations
  - `StvStrategyPool` contract with strategy-based pool management
  - `WithdrawalQueue` contract for managing withdrawal requests
- New ABIs for all DeFi Wrapper contracts with full method signatures
- Comprehensive CLI documentation for all DeFi Wrapper commands

#### Validator Management Enhancements

- BLS signature validation for deposits to ensure cryptographic correctness
- Error handling for proof creation in validator deposit flows
- Enhanced validator status documentation with activation and balance management details
- Updated deposit commands to support new validator activation workflows
- Detailed amounts display in `eject-validators` command with confirmation messages

#### Dashboard & Contracts Updates

- Updated `VaultViewer` ABI with new `totalValueRemainder` field
- Updated `LazyOracle` and `VaultHub` ABIs with enhanced functionality
- Enhanced `Dashboard` integration with improved command structure
- Added new commands for reading contract metrics with ETH formatting
- Support for disconnected vault checks in report freshness validation

#### Transaction & Wallet Improvements

- Interrupt handling (SIGINT/SIGTERM) for graceful CLI shutdown
- Enhanced transaction handling for Gnosis Safe multisig cases
- Improved WalletConnect client structure and error logging
- Better transaction status tracking and user feedback

#### Developer Experience

- CSV output option for metrics commands
- Enhanced error logging in `fetchCL` utility for unsupported fork names
- `SupportedFork` constants for better modularity
- Share limit formatting with `formatEther` for consistency
- Improved argument parsing utilities

### Changed

#### Deposits & Withdrawals

- Updated deposit command syntax from `top-up` to `top-up-no`
- Format descriptions now specify amounts are in gwei for clarity
- Enhanced deposit process documentation with step-by-step guides

#### Vault Operations

- Improved vault creation logic with confirm expiry and node operator fee rate retrieval
- Enhanced vault info display with better formatting
- Updated share limit commands to use `stringToAddress` and `formatEther`
- Refined vault overview calculations

#### Configuration & Deployment

- Updated Hoodi testnet deployment configurations
- Package.json repository structure refinements
- Updated package dependencies for better compatibility

### Fixed

- Log message for disconnected vault check now clarifies connection status
- Share limit in vault info now uses `formatEther` for consistency
- Transaction handling for edge cases in Gnosis Safe environments
- Improved error messages and validation throughout CLI

### Documentation

- Updated reports documentation clarifying permissionless report submissions
- Refined account command documentation
- Enhanced deposit process guides with activation details
- Updated contract command documentation for Dashboard and LazyOracle
- Added comprehensive DeFi Wrapper documentation

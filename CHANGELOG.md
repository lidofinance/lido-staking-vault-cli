All notable changes to this project will be documented in this file.

## 1.8.0

### Added

- Addresses in table outputs are now clickable links to block explorers

#### DeFi Wrapper

- `defi-wrapper contracts strategy` module for interacting with Strategy contracts connected to StvStrategyPool
- `defi-wrapper use-cases timelock-governance strategy` module for proposing and executing timelock operation of Strategy contracts connected to StvStrategyPool.
- `defi-wrapper use-cases wrapper-operations` allowList commands now directly indicate support fot Strategy Contracts
- `defi-wrapper use-cases wrapper-operations read info` now displays connected Strategies

## 1.7.0

### Added

#### DeFi Wrapper

- use case distributor now has `claim` command and `distribute` command now supports modes for `snapshot` generation

#### Metrics

- added `statistic-by-reports-full` command for full report-by-report metrics breakdown
- improved metrics calculation accuracy: refined `report-statistic`, `rebase-rewards`, and chart dataset utilities

#### Testing & Build

- added ~90 unit and integration tests covering utilities, consolidation checks, cache, report freshness, quarantine, and minting capacity
- migrated ESLint from v8 to v10 with flat config; added SonarJS, unicorn, vitest, and promise plugins

### Fixed

- IPFS utils now support CIDv1
- fixed help message display for distributor commands

## 1.6.0

### Fixed

- [Dashboard,VaultHub] fixed `trigger-validator-withdrawal` command for multiple pubkeys
- [DeFi Wrapper] fixed incorrect parsing of `--salt` option for all timelock operations
- Edge case in pdg-helpers validator-info when validator is not yet present on CL
- improved DefiWrapper factory commands options parsing, prompting and error handling
- improved `defi-wrapper use-cases w auto-report` to use polling instead of subscription for better reliability
- improved `--walletConnect` behavior for non-7702 wallets
- [Metrics] node operator fee now uses `Δ(noEarnings)` — correctly accounts for mid-period fee withdrawals; previously, when NO withdrew fees during a period, `accruedFee` reset to zero causing netAPR to be overstated
- [Metrics] stETH liability rebase adjustment now uses opening shares only (`sharesPrev × ΔshareRate`), fixing incorrect CarrySpread values when new stETH was minted mid-period
- [Metrics] `accruedFee` is now computed off-chain from IPFS data — stays correct even when vault owner hasn't applied the latest oracle report on-chain

### Added

#### General

- Added `create-strategy-pool-lido-earn-eth` to `defi-wrapper contracts factory w`
- JSON output now outputs only json array without additional log messages for better parsing in scripts
- All common options are now available in `--help` for all commands for better discoverability
- added `account write send-tx` command for manually sending transactions with connected wallet accounts
- `update-vault-share-limit`/`change-tier` commands now accepts steth amount via `--steth`

#### DeFi Wrapper

- manual pool creation finalization and logging after creation tx is executed

#### Metrics

- added `docs/cli/metrics-calculation.md` — reference documentation for all metric formulas and methodology

## 1.5.0

### Added

#### DeFi Wrapper & Governance

- Timelock governance use-cases (common/dashboard/pool/proxy/withdrawal-queue) with propose/execute flows and operation inspection
- Distributor use-case for Merkle-based rewards distribution (state, add-token, set merkle root, generate/upload distributions)
- Wrapper Operations enhancements: allow-list read/add/remove, auto-reporting, withdrawal queue status, and richer pool info output

#### Dashboard & PDG

- Fee exemption command in Dashboard CLI to exclude value from node operator fee base
- Node syncing status checks during PDG flows; updated PredepositGuarantee ABI

#### Contracts & ABIs

- Added TimeLock and OssifiableProxy ABIs
- Updated DeFi Wrapper Factory and stETH ABIs

#### Utilities & Testing

- RPC rate-limiting utility with tests for batch processing

### Changed

- Streamlined DeFi wrapper pool creation by removing legacy `create-pool`/ggv use-case in wrapper operations
- Migrated wrapper testnet configs and removed deprecated Hoodi/Sepolia vault lists
- Adjusted timelock minimum delay validation

### Fixed

- Improved withdrawal queue status output and claim guidance; added error logging in wrapper operations
- Parameter/validation fixes across DeFi Wrapper flows and reporting utilities

### Documentation

- Added DeFi Wrapper docs for creating wrappers, distributor, timelock governance, and wrapper operations
- Updated deposit docs (gwei units), configuration links, and testnet references

## 1.4.0

### Added

#### CLI Enhancements

- Conditional display of Mainnet V3 Web UI link based on target date (2026-01-29)

### Fixed

#### Contracts Updates

- Updated Mainnet VaultViewer contract address to the new redeployed address (0x93DaaEa5D290Da9a7A6A65fe4F6C1D3ebb44E0e1)

## 1.3.1

### Fixed

#### Vault Operations

- Removed report check for fund operation to allow funding without report validation

#### CLI Configuration

- Updated IPFS gateway option to require a string argument for proper configuration

## 1.3.0

### Added

#### Testing & CI/CD

- Migrated testing framework from Jest to Vitest for improved performance and modern tooling
- Added comprehensive integration tests with Anvil environment configuration
- Enhanced GitHub Actions workflow with unit and integration test execution
- Added Foundry installation step to CI pipeline
- Improved test assertions and logging with additional scenarios and JSON output handling

#### Vault Operations & Tier Management

- Added `connect-and-accept-tier` command with vault address argument for tier change operations
- Enhanced tier change commands with improved documentation and usage examples
- Added `effectiveBalance` field to source and target validators in pubkeys utility

#### Contracts & ABIs

- Added `accruedFee` field to VaultViewer ABI
- Updated contract addresses for Hoodi and Mainnet deployments

#### CLI Enhancements

- Added JSON output option to CLI commands
- Enhanced console logging throughout the application
- Improved transaction batching for better performance
- Added mainnet support with updated testnet warnings in CLI
- Enhanced deposit verification with structured `depositsY` object and improved logging
- Added new commands for pool creation finalization and logging pool data for DeFi Wrapper

#### Validator & Proof Management

- Integrated validator checks into proof creation and dashboard error handling

### Changed

- Streamlined pool creation process for DeFi Wrapper operations
- Updated timestamp formatting in lazy oracle feature and tests
- Refactored vault operations and integration tests with expected data structures
- Enhanced transaction log messages with constants for better maintainability

### Fixed

- Fixed dashboard contract retrieval await in operator grid write function
- Fixed formatting of members list
- Improved validator skipping logic to ensure proper confirmation handling
- Updated transaction log message for clarity on vault data retrieval command

### Documentation

- Updated vault operations documentation to clarify tier change commands and their requirements
- Enhanced vault operations documentation with usage examples and options
- Updated deposits and wallet-connect documentation
- Updated README and intro documentation to clarify branch selection and usage
- Removed redundant header from changelog

### Chore

- Marked `calculateOverview` as deprecated and updated comment in `confirmMint`
- Removed unused worktree configuration file
- Updated ESLint configuration and added tests
- Added CONFIRMATIONS variable to checks workflow for enhanced configuration

## 1.2.0

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

## 1.1.0

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

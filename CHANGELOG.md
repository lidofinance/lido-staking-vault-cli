# Changelog

All notable changes to this project will be documented in this file.

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

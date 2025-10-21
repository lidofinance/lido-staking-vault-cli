# MCP Server Setup for Lido Staking Vault CLI

This guide explains how to integrate the Lido Staking Vault CLI as an MCP (Model Context Protocol) server with Claude Desktop.

## What is MCP?

MCP (Model Context Protocol) allows Claude Desktop to interact with external tools and data sources. This integration provides **AUTOMATIC** access to ALL Lido Staking Vault CLI commands by introspecting the CLI structure at runtime.

## Key Features

✅ **Fully Automatic** - 418+ commands auto-discovered from CLI structure  
✅ **Zero Duplication** - Tools call actual CLI commands via `yarn start`  
✅ **Self-Updating** - New CLI commands automatically become MCP tools  
✅ **Commander Integration** - Introspects Commander program structure  
✅ **Consistent Behavior** - Exactly same as running CLI manually

## Prerequisites

- Node.js 20+ installed
- Claude Desktop app installed
- Lido Staking Vault CLI installed and built (`yarn install && yarn build`)

## Installation Steps

### 1. Build the MCP Server

```bash
cd /path/to/liquid-staking-vault-cli
yarn install
yarn build
```

### 2. Configure Claude Desktop

Add the MCP server configuration to your Claude Desktop config file:

**Location of config file:**

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

**Configuration:**

```json
{
  "mcpServers": {
    "lido-staking-vault-cli": {
      "command": "node",
      "args": [
        "/absolute/path/to/liquid-staking-vault-cli/dist/mcp-server/index.js"
      ],
      "env": {
        "CHAIN_ID": "560048",
        "EL_URL": "https://your-execution-layer-endpoint",
        "CL_URL": "https://your-consensus-layer-endpoint",
        "DEPLOYED": "deployed-hoodi-vaults.json",
        "PRIVATE_KEY": "0x..."
      }
    }
  }
}
```

**Important:** Replace `/absolute/path/to/liquid-staking-vault-cli` with the actual absolute path on your system.

### 3. Environment Variables

Configure these environment variables in the `env` section:

| Variable                | Description                             | Required | Example                      |
| ----------------------- | --------------------------------------- | -------- | ---------------------------- |
| `CHAIN_ID`              | Ethereum chain ID                       | Yes      | `560048` (Hoodi)             |
| `EL_URL`                | Execution layer RPC endpoint            | Yes      | `https://rpc.hoodi.io`       |
| `CL_URL`                | Consensus layer endpoint                | Yes      | `https://cl.hoodi.io`        |
| `DEPLOYED`              | Deployed contracts config file          | Yes      | `deployed-hoodi-vaults.json` |
| `PRIVATE_KEY`           | Wallet private key for write operations | No\*     | `0x123...`                   |
| `ACCOUNT_FILE`          | Path to encrypted wallet file           | No\*     | `wallets/vault-owner.json`   |
| `ACCOUNT_FILE_PASSWORD` | Password for encrypted wallet           | No\*     | `your-password`              |

\* At least one wallet configuration method is required for write operations

### 4. Restart Claude Desktop

After editing the config file, completely quit and restart Claude Desktop for changes to take effect.

## Available Tools (418 Commands!)

The MCP server **automatically discovers and registers ALL CLI commands**:

### 🎯 Auto-Discovery Stats

```
📦 Found 418 CLI commands
🔧 Registered MCP tools...

✅ Registered tools by category:
   contracts: 343 commands
   account: 10 commands
   pdg-helpers: 8 commands
   vault-operations: 23 commands
   deposits: 16 commands
   report: 11 commands
   metrics: 7 commands

🎉 Total: 418 MCP tools ready!
```

### 📦 Contracts (343 commands)

All contract operations auto-discovered:

- **Dashboard**: info, overview, roles, health, fund, withdraw, mint/burn, rebalance, etc.
- **Vault Hub**: connection management, vault registry, rebalancing
- **Vault**: direct vault operations, deposits, ownership
- **Operator Grid**: tier management, share limits, confirmations
- **Factory**: vault creation and deployment
- **LazyOracle**: oracle reports and data feeds
- **PredepositGuarantee**: predeposit lifecycle and proofs
- **VaultViewer**: batch vault queries and analytics

### 👤 Account (10 commands)

Wallet and token management:

- Balance queries (ETH, stETH, wstETH)
- Token allowance management
- Account information

### 🔐 PDG Helpers (8 commands)

Validator and cryptographic operations:

- Proof generation and validation
- BLS signature verification
- Deposit data computation
- Validator information queries

### 🏦 Vault Operations (23 commands)

High-level vault management:

- Read: info, health, overview, roles
- Write: fund, withdraw, mint/burn tokens
- Create: vault deployment

### 💰 Deposits (16 commands)

Validator deposit lifecycle:

- Predeposit validators
- Proof and prove validators
- Node operator balance management
- Validator status tracking

### 📊 Reports (11 commands)

Oracle and reporting:

- Latest report data
- Vault-specific reports
- Merkle proof generation
- Report submission

### 📈 Metrics (7 commands)

Performance analytics:

- APR calculations
- Historical statistics
- Rewards tracking
- CSV export

## Tool Naming Convention

All tools follow automatic naming from CLI structure:

```
cli_<category>_<subcommand>_<action>_<method>

Examples:
- cli_contracts_dashboard_read_info
- cli_contracts_hub_write_v_connect
- cli_vault_operations_read_health
- cli_deposits_write_predeposit
- cli_metrics_read_statistic_by_reports
- cli_pdg_helpers_proof_and_check
```

## How It Works

```
┌─────────────┐
│   Claude    │
│  Desktop    │
└──────┬──────┘
       │ MCP Request
       ▼
┌─────────────────┐
│  MCP Server     │
│  (Auto-Gen)     │
├─────────────────┤
│ 1. Import CLI   │
│ 2. Introspect   │
│    Commander    │
│ 3. Extract 418  │
│    commands     │
│ 4. Generate     │
│    MCP tools    │
└──────┬──────────┘
       │ execAsync
       ▼
┌─────────────────┐
│ yarn start CLI  │
│ (Actual Impl)   │
└─────────────────┘
```

**Process:**

1. MCP server imports CLI program from `command/index.ts`
2. Recursively extracts all commands using Commander API
3. For each command:
   - Generates tool name from command path
   - Extracts description, options, arguments
   - Creates Zod schema from command signature
   - Registers MCP tool with callback
4. Tool callback builds CLI command string and executes it
5. Output formatted and returned to Claude

**Benefits:**

- 🔄 **Self-Updating**: Add command to CLI → Automatically available in MCP
- 📚 **Documentation-Driven**: Uses CLI help text for descriptions
- 🎯 **Type-Safe**: Zod schemas generated from Commander options
- 🚀 **Zero Maintenance**: No manual tool registration needed

## Usage Examples

Once configured, you can interact with ALL 418 CLI commands through Claude Desktop:

**Example conversations:**

```
You: "Show me information about vault 0x1234..."
Claude: [Uses cli_contracts_vault_read_info or cli_vault_operations_read_info]

You: "What's the APR trend for the last 10 reports?"
Claude: [Uses cli_metrics_read_statistic_by_reports with count=10]

You: "Submit oracle reports for all vaults"
Claude: [Uses cli_report_write_submit_all]

You: "Check validator status for pubkey 0xabc..."
Claude: [Uses cli_deposits_read_validator_status or cli_pdg_helpers_validator_info]

You: "Show me all roles for dashboard 0x5678"
Claude: [Uses cli_contracts_dashboard_read_roles]

You: "Generate BLS proof for validator index 12345"
Claude: [Uses cli_pdg_helpers_proof]
```

## Troubleshooting

### Server Not Showing Up

1. Check that the path in `claude_desktop_config.json` is absolute and correct
2. Ensure `dist/mcp-server/index.js` exists (run `yarn build` if not)
3. Restart Claude Desktop completely
4. Check Claude Desktop logs for errors

### Tool Execution Errors

1. Verify environment variables are set correctly
2. Check that RPC endpoints are accessible
3. Ensure private key has sufficient ETH for gas
4. Verify the deployed contracts config file exists
5. Check if CLI command works manually: `yarn start <command>`

### Connection Issues

- Ensure RPC endpoints match the configured chain ID
- Test endpoints outside Claude Desktop first
- Check firewall/network restrictions

### Command Discovery Issues

- Verify `yarn build` completed successfully
- Check that all CLI programs are registered in `programs/index.ts`
- Look at MCP server stderr logs for discovery errors

## Security Considerations

⚠️ **Important Security Notes:**

1. **Private Keys**: Never commit private keys to version control. Consider using encrypted wallet files.
2. **Config File**: The Claude Desktop config file contains sensitive data. Protect it appropriately.
3. **Network Access**: The MCP server will have network access to your configured RPC endpoints.
4. **Write Operations**: The server can execute blockchain transactions. Review operations carefully.
5. **CLI Execution**: Tools execute actual CLI commands - same security model as CLI.
6. **Auto-Discovery**: All CLI commands are exposed automatically - review command access needs.

## Development

The MCP server is fully automatic - no manual tool registration needed!

### Adding New Commands

Simply add commands to the CLI using Commander:

```typescript
// programs/my-module/index.ts
import { program } from '../../command/index.js';

const myModule = program.command('my-module');

myModule
  .command('my-command <arg>')
  .description('Does something cool')
  .option('-f, --flag', 'Some flag')
  .action(async (arg, options) => {
    // Implementation
  });
```

**Result**: Command automatically appears as `cli_my_module_my_command` MCP tool!

### Architecture

```
mcp-server/
├── index.ts                      # Auto-registers all commands
└── utils/
    ├── cli-introspection.ts      # Commander introspection
    └── cli-exec.ts               # Command execution
```

### How Commands Are Discovered

1. **Import**: `import { program } from '../command/index.js'`
2. **Load**: `import '../programs/index.js'` - registers all commands
3. **Extract**: `extractAllCommands(program)` - recursively walks Commander tree
4. **Generate**: For each command, create:
   - Tool name from command path
   - Zod schema from options/arguments
   - Callback that builds and executes CLI command
5. **Register**: `server.tool(...)` for each command

For detailed information about MCP servers, see the [MCP documentation](https://modelcontextprotocol.io/docs).

## Complete Documentation

For detailed command documentation with examples, parameters, and use cases:

- **Vault Operations**: `docs/cli/commands/vault-operations.md`
- **Deposits**: `docs/cli/commands/deposits.md`
- **Reports**: `docs/cli/commands/report.md`
- **Metrics**: `docs/cli/commands/metrics.md`
- **Account**: `docs/cli/commands/account.md`
- **Contracts**: `docs/cli/commands/contracts/` (dashboard, hub, operator-grid, etc.)
- **PDG Helpers**: `docs/cli/commands/pdg-helpers.md`

## Version History

- **v3.0.0**: Automatic command discovery - 418 commands auto-registered
- **v2.0.0**: CLI-based tools with manual registration - 40 commands
- **v1.0.0**: Direct code integration - 13 commands

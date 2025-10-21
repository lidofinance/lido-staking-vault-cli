# Lido Staking Vault CLI - MCP Server

Automatic MCP (Model Context Protocol) server that exposes **ALL 418+ CLI commands** to Claude Desktop through intelligent introspection.

## 🚀 Quick Start

```bash
# 1. Build
yarn build

# 2. Configure Claude Desktop
# Add to ~/Library/Application Support/Claude/claude_desktop_config.json

# 3. Use ALL CLI commands through Claude!
```

## 🎯 Features

- ✅ **418+ Commands** - All CLI commands automatically discovered
- ✅ **Zero Duplication** - Calls actual CLI implementation
- ✅ **Self-Updating** - New CLI commands = new MCP tools automatically
- ✅ **Type-Safe** - Zod schemas generated from Commander structure

## 📊 Command Coverage

```
contracts:         343 commands  (Dashboard, Hub, Vault, Factory, Grid, PDG, Oracle, Viewer)
account:            10 commands  (Balance, allowances, info)
pdg-helpers:         8 commands  (Proofs, BLS validation, crypto)
vault-operations:   23 commands  (Management, funding, minting)
deposits:           16 commands  (Validator lifecycle)
report:             11 commands  (Oracle data)
metrics:             7 commands  (Analytics, APR)
─────────────────────────────────
Total:             418 commands
```

## 🏗️ Architecture

### How It Works

1. **Import CLI Program** - Loads Commander program with all commands
2. **Introspect Structure** - Recursively extracts all commands, options, arguments
3. **Generate Tools** - Creates MCP tool for each CLI command
4. **Execute** - Tool callbacks run actual CLI via `yarn start`

### Files

```
mcp-server/
├── index.ts                    # Auto-registers all commands
└── utils/
    ├── cli-introspection.ts    # Commander introspection & tool generation
    └── cli-exec.ts             # CLI command execution wrapper
```

## 🔧 How Commands Become Tools

### CLI Command

```typescript
program
  .command('vault-operations')
  .alias('vo')
  .command('read')
  .alias('r')
  .command('info')
  .description('Get vault information')
  .option('-v, --vault <address>', 'Vault address')
  .action(async (options) => {
    // Implementation
  });
```

### Auto-Generated MCP Tool

```typescript
// Automatically created by introspection:
{
  name: "cli_vault_operations_read_info",
  description: "Get vault information",
  schema: {
    vault: z.string().optional().describe("Vault address"),
    yes: z.boolean().optional().describe("Skip confirmations")
  },
  callback: async ({ vault, yes }) => {
    const cmd = vault ? `vo r info -v ${vault}` : `vo r info`;
    if (yes) cmd += ' -y';
    const result = await executeCLICommand(cmd);
    return formatCLIOutput(result);
  }
}
```

## 🆕 Adding New Commands

**No MCP code needed!** Just add command to CLI:

```typescript
// programs/my-feature/index.ts
import { program } from '../../command/index.js';

program
  .command('my-feature')
  .command('do-something <arg>')
  .description('Does something')
  .option('-f, --flag', 'Some flag')
  .action(async (arg, options) => {
    // Your implementation
  });
```

**Result**: `cli_my_feature_do_something` tool automatically available!

## 🔍 Tool Discovery

Run server locally to see discovered commands:

```bash
node dist/mcp-server/index.js 2>&1 | head -20

# Output:
# 🔍 Extracting CLI commands...
# 📦 Found 418 CLI commands
# 🔧 Registering MCP tools...
#
# ✅ Registered tools by category:
#    contracts: 343 commands
#    account: 10 commands
#    ...
```

## 📚 Documentation

See [MCP_SETUP.md](../MCP_SETUP.md) for:

- Claude Desktop configuration
- Environment variables
- Usage examples
- Troubleshooting
- Security considerations

## 🛠️ Development

### Testing Command Discovery

```bash
# See all discovered commands
node dist/mcp-server/index.js 2>&1 | grep "✅"

# Test specific command execution
yarn start vault-operations read info -v 0x123...

# Then verify MCP tool works the same way
```

### Debugging

```bash
# Enable detailed logging
NODE_ENV=development node dist/mcp-server/index.js

# Check command parsing
node -e "
const { program } = require('./dist/command/index.js');
require('./dist/programs/index.js');
console.log('Commands:', program.commands.map(c => c.name()));
"
```

## 🎓 How Introspection Works

### Commander Structure

```javascript
program.commands = [
  Command {
    _name: 'contracts',
    _description: 'contracts commands',
    commands: [
      Command {
        _name: 'dashboard',
        commands: [
          Command { _name: 'read', commands: [...] },
          Command { _name: 'write', commands: [...] }
        ]
      }
    ],
    options: [Option { flags: '-v, --vault <address>', description: '...' }]
  }
]
```

### Extraction Process

```typescript
function extractAllCommands(program, parentPath = '') {
  const commands = [];

  for (const cmd of program.commands) {
    const fullPath = parentPath ? `${parentPath} ${cmd.name()}` : cmd.name();

    commands.push({
      name: cmd.name(),
      fullPath, // "contracts dashboard read info"
      description: cmd.description(),
      options: extractOptions(cmd),
      arguments: extractArguments(cmd),
      aliases: cmd.aliases(),
    });

    // Recurse into subcommands
    if (cmd.commands.length > 0) {
      commands.push(...extractAllCommands(cmd, fullPath));
    }
  }

  return commands;
}
```

### Tool Generation

```typescript
function registerCommand(command) {
  const toolName = 'cli_' + command.fullPath.replace(/\s+/g, '_');
  const schema = commandToZodSchema(command); // Auto-generate from options

  server.tool(
    toolName,
    schema,
    { description: command.description },
    async (params) => {
      const cmdString = buildCommandString(command, params);
      const result = await executeCLICommand(cmdString);
      return formatCLIOutput(result);
    },
  );
}
```

## 🔒 Security

- All CLI security policies apply (same as running manually)
- Private keys managed by environment variables
- Claude requires user approval for each tool execution
- Commands execute with configured wallet permissions

## 📊 Metrics

**Before (v2.0)**: 40 manually coded tools  
**After (v3.0)**: 418 automatically discovered tools  
**Code Reduction**: ~2000 lines of manual tool code eliminated  
**Maintenance**: Zero - new commands automatically included

## 🤝 Contributing

No MCP-specific code needed for new commands! Just:

1. Add command to CLI using Commander
2. Rebuild: `yarn build`
3. Command automatically available in MCP

For bugs/issues in introspection logic, see `utils/cli-introspection.ts`.

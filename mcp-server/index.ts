#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import * as dotenv from 'dotenv';
import { program } from '../command/index.js';
import '../programs/index.js'; // This registers all CLI commands

import {
  extractAllCommands,
  commandToToolName,
  commandToZodSchema,
  buildCommandString,
  type CLICommand,
} from './utils/cli-introspection.js';
import { executeCLICommand, formatCLIOutput } from './utils/cli-exec.js';

dotenv.config();

const server = new McpServer(
  {
    name: 'Lido Staking Vault CLI MCP Server',
    version: '3.0.0',
  },
  {
    instructions: `
Lido Staking Vault CLI MCP Server - Complete Access to ALL CLI Commands

This server provides AUTOMATIC access to ALL 200+ Lido Staking Vault CLI commands.
Commands are auto-generated from the CLI structure - no code duplication!

🎯 How It Works:
- MCP server introspects the CLI program structure using Commander
- Automatically generates MCP tools for every CLI command
- Each tool calls the actual CLI command via 'yarn start'
- Returns formatted output to Claude

📦 Available Command Categories:
- contracts (c): Dashboard, Hub, Vault, Factory, Operator Grid, PDG, LazyOracle, VaultViewer
- account: Wallet and token allowance management
- pdg-helpers: Validator proofs, BLS validation, cryptographic helpers
- vault-operations (vo): Vault management, funding, minting, burning
- deposits (d): Validator deposits through PredepositGuarantee
- report (r): Oracle reports and LazyOracle updates  
- metrics (m): Performance analytics and APR calculations

🔧 Tool Naming Convention:
- Format: cli_<command>_<subcommand>_<action>
- Examples:
  * cli_contracts_dashboard_read_info
  * cli_vo_read_health
  * cli_deposits_write_predeposit
  * cli_metrics_read_statistic

📚 Documentation:
For detailed command documentation with examples:
- docs/cli/commands/ - Complete command reference
- Each tool description includes parameters from CLI help

🎛️ Configuration:
Uses .env file: CHAIN_ID, EL_URL, CL_URL, DEPLOYED, PRIVATE_KEY/ACCOUNT_FILE

💡 Usage Tips:
- ⚠️ CRITICAL: ALWAYS ask the user for ALL parameters (including optional ones) BEFORE executing any command
  This prevents the CLI from entering interactive mode which would hang indefinitely
- If a parameter is not provided by the user, explicitly ask them for it
- All commands support -y flag to skip confirmations (automatically added)
- Use --csv flag to export table outputs
- Check tool descriptions for specific parameters and their requirements

Total Tools Available: ${program.commands.length}+ commands recursively
  `,
  },
);

/**
 * Register a single CLI command as an MCP tool
 */
const registerCommand = (command: CLICommand) => {
  const toolName = commandToToolName(command);
  const schemaFields = commandToZodSchema(command);

  // Create tool description with details
  let description =
    command.description || `Execute CLI command: ${command.fullPath}`;

  if (command.aliases.length > 0) {
    description += ` (aliases: ${command.aliases.join(', ')})`;
  }

  // Important note about interactive prompts
  description +=
    "\n\n⚠️ IMPORTANT: To avoid interactive prompts, ALWAYS ask the user for ALL parameters (including optional ones) BEFORE executing this command. If user doesn't provide a parameter, ask them explicitly.";

  // Add argument info to description
  if (command.arguments.length > 0) {
    description += '\n\nArguments:';
    for (const arg of command.arguments) {
      const required = arg.required ? 'required' : 'optional';
      description += `\n- ${arg.name} (${required}): ${arg.description}`;
    }
  }

  // Add option info to description
  if (command.options.length > 0) {
    description += '\n\nOptions:';
    for (const opt of command.options) {
      const isRequired = opt.flags.includes('<') && !opt.flags.includes('[');
      const reqLabel = isRequired ? ' (REQUIRED)' : '';
      description += `\n- ${opt.flags}${reqLabel}: ${opt.description}`;
    }
  }

  server.tool(
    toolName,
    description, // Description as 2nd parameter (string)
    schemaFields, // Schema as 3rd parameter (object with zod fields)
    async (params: any) => {
      try {
        const cmdString = buildCommandString(command, params);
        const result = await executeCLICommand(cmdString);

        // Check if command execution failed
        if (!result.success) {
          return {
            content: [
              {
                type: 'text' as const,
                text: `❌ Command failed (exit code ${result.exitCode}):\n\n${result.stderr}\n\nCommand: ${command.fullPath}\n\nTip: Check required arguments and options.`,
              },
            ],
            isError: true,
          };
        }

        return {
          content: [{ type: 'text' as const, text: formatCLIOutput(result) }],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Error executing command: ${error.message}\n\nCommand: ${command.fullPath}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
};

/**
 * Auto-register all CLI commands as MCP tools
 */
const registerAllCommands = () => {
  console.error('🔍 Extracting CLI commands...');

  const commands = extractAllCommands(program);

  console.error(`📦 Found ${commands.length} CLI commands`);
  console.error('🔧 Registering MCP tools...\n');

  // Group commands by category for better logging
  const categories = new Map<string, CLICommand[]>();

  for (const command of commands) {
    const category = command.fullPath.split(' ')[0] || 'general';
    if (!categories.has(category)) {
      categories.set(category, []);
    }
    const categoryCommands = categories.get(category);
    if (categoryCommands) {
      categoryCommands.push(command);
    }

    registerCommand(command);
  }

  // Log registered tools by category
  console.error('✅ Registered tools by category:');
  for (const [category, cmds] of categories.entries()) {
    console.error(`   ${category}: ${cmds.length} commands`);
  }

  console.error(`\n🎉 Total: ${commands.length} MCP tools ready!\n`);
};

// Register all commands automatically
registerAllCommands();

const startServer = async () => {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('🚀 Lido Staking Vault MCP Server started on stdio\n');
};

startServer().catch((error) => {
  console.error('❌ Error starting server:', error);
  process.exit(1);
});

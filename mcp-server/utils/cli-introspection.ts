import { Command } from 'commander';
import { z } from 'zod';

/**
 * Represents a CLI command structure
 */
export interface CLICommand {
  name: string;
  fullPath: string; // e.g., "contracts dashboard read info"
  description: string;
  options: CLIOption[];
  arguments: CLIArgument[];
  aliases: string[];
}

export interface CLIOption {
  flags: string; // e.g., "-v, --vault <address>"
  description: string;
  required: boolean;
  defaultValue?: any;
}

export interface CLIArgument {
  name: string;
  description: string;
  required: boolean;
  variadic: boolean;
}

/**
 * Recursively extract all commands from a Commander program
 */
export const extractAllCommands = (
  program: Command,
  parentPath = '',
): CLICommand[] => {
  const commands: CLICommand[] = [];

  // Get all subcommands
  const subCommands = program.commands;

  for (const cmd of subCommands) {
    const cmdName = cmd.name();
    const fullPath = parentPath ? `${parentPath} ${cmdName}` : cmdName;

    // Skip help commands
    if (cmdName === 'help') continue;

    // Extract command info
    const command: CLICommand = {
      name: cmdName,
      fullPath,
      description: cmd.description() || '',
      aliases: cmd.aliases(),
      options: extractOptions(cmd),
      arguments: extractArguments(cmd),
    };

    commands.push(command);

    // Recursively process subcommands
    if (cmd.commands && cmd.commands.length > 0) {
      const subCmds = extractAllCommands(cmd, fullPath);
      commands.push(...subCmds);
    }
  }

  return commands;
};

/**
 * Extract options from a command
 */
const extractOptions = (cmd: Command): CLIOption[] => {
  const options: CLIOption[] = [];

  for (const option of cmd.options) {
    // Skip global options that are not specific to this command
    if (option.flags.includes('--help')) continue;

    options.push({
      flags: option.flags,
      description: option.description || '',
      required: option.required,
      defaultValue: option.defaultValue,
    });
  }

  return options;
};

/**
 * Extract arguments from a command
 */
const extractArguments = (cmd: Command): CLIArgument[] => {
  const args: CLIArgument[] = [];

  // Commander stores arguments in _args or registeredArguments
  const cmdArgs = (cmd as any)._args || (cmd as any).registeredArguments || [];

  for (const arg of cmdArgs) {
    args.push({
      name: arg.name(),
      description: arg.description || '',
      required: arg.required,
      variadic: arg.variadic,
    });
  }

  return args;
};

/**
 * Convert CLI command to Zod schema for MCP
 */
export const commandToZodSchema = (command: CLICommand): any => {
  const schema: any = {};

  // Add arguments to schema
  for (const arg of command.arguments) {
    const argName = arg.name.replace(/[<>[\]]/g, '');

    // Improve description for required parameters
    const description = arg.description
      ? `${arg.description}${arg.required ? ' (REQUIRED)' : ' (optional)'}`
      : arg.required
        ? 'Required parameter'
        : 'Optional parameter';

    if (arg.variadic) {
      // Variadic arguments are arrays
      const arraySchema = z.array(z.string()).describe(description);
      // For required args, don't make them optional - MCP will require them
      schema[argName] = arg.required ? arraySchema : arraySchema.optional();
    } else {
      const stringSchema = z.string().describe(description);
      // For required args, don't make them optional - MCP will require them
      schema[argName] = arg.required ? stringSchema : stringSchema.optional();
    }
  }

  // Add options to schema
  for (const option of command.options) {
    // Parse option name from flags (e.g., "-v, --vault <address>" -> "vault")
    const match = option.flags.match(/--([a-z-]+)/);
    if (!match || !match[1]) continue;

    const optionName = match[1].replace(/-([a-z])/g, (_, letter) =>
      letter.toUpperCase(),
    );

    // Detect if option is required (uses <> brackets) vs optional (uses [] brackets)
    const isRequired =
      option.flags.includes('<') && !option.flags.includes('[');

    // Improve description to show if required
    const description = option.description
      ? `${option.description}${isRequired ? ' (REQUIRED)' : ''}`
      : isRequired
        ? 'Required option'
        : 'Optional option';

    // Determine type based on flags
    if (option.flags.includes('<') || option.flags.includes('[')) {
      // Has a value
      const stringSchema = z.string().describe(description);
      schema[optionName] = isRequired ? stringSchema : stringSchema.optional();
    } else {
      // Boolean flag (always optional)
      schema[optionName] = z.boolean().optional().describe(description);
    }
  }

  // Add common flags
  schema['yes'] = z.boolean().optional().describe('Skip confirmation prompts');

  return schema;
};

/**
 * Build CLI command string from parameters
 */
export const buildCommandString = (
  command: CLICommand,
  params: Record<string, any>,
): string => {
  let cmd = command.fullPath;

  // Add arguments
  for (const arg of command.arguments) {
    const argName = arg.name.replace(/[<>[\]]/g, '');
    const value = params[argName];

    if (value !== undefined) {
      if (Array.isArray(value)) {
        cmd += ' ' + value.join(' ');
      } else if (typeof value === 'string' && value.includes(' ')) {
        cmd += ` '${value}'`;
      } else {
        cmd += ' ' + value;
      }
    }
  }

  // Add options
  for (const option of command.options) {
    const match = option.flags.match(/--([a-z-]+)/);
    if (!match || !match[1]) continue;

    const optionName = match[1].replace(/-([a-z])/g, (_, letter) =>
      letter.toUpperCase(),
    );
    const value = params[optionName];

    if (value !== undefined && value !== null && value !== false) {
      const optionFlag = '--' + match[1];

      if (typeof value === 'boolean' && value === true) {
        cmd += ` ${optionFlag}`;
      } else if (typeof value !== 'boolean') {
        if (typeof value === 'string' && value.includes(' ')) {
          cmd += ` ${optionFlag} '${value}'`;
        } else {
          cmd += ` ${optionFlag} ${value}`;
        }
      }
    }
  }

  // Add common flags
  if (params['yes']) {
    cmd += ' -y';
  }

  return cmd;
};

/**
 * Generate MCP tool name from command path
 * MCP requires tool names to be max 64 characters
 */
export const commandToToolName = (command: CLICommand): string => {
  // Convert "contracts dashboard read info" to "cli_contracts_dashboard_read_info"
  // Replace spaces with underscores and remove any non-alphanumeric chars except underscore
  let name =
    'cli_' +
    command.fullPath
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_]/g, '_')
      .replace(/_+/g, '_'); // Remove duplicate underscores

  // MCP protocol limit is 64 characters
  if (name.length <= 64) {
    return name;
  }

  // For long names, use abbreviations and keep last segment
  const parts = command.fullPath.split(' ');
  const lastSegment = (parts[parts.length - 1] || 'cmd')
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .replace(/_+/g, '_');

  // Abbreviate middle parts: "contracts" -> "c", "dashboard" -> "d", etc.
  const abbreviated = parts
    .slice(0, -1)
    .map((part) => part.charAt(0))
    .join('_');

  name = abbreviated
    ? `cli_${abbreviated}_${lastSegment}`
    : `cli_${lastSegment}`;

  // If still too long, truncate last segment and add hash for uniqueness
  if (name.length > 64) {
    const hash = createSimpleHash(command.fullPath);
    const prefix = abbreviated ? `cli_${abbreviated}_` : 'cli_';
    const maxLastSegmentLength = 64 - `${prefix}_${hash}`.length;
    const truncatedLast = lastSegment.substring(0, maxLastSegmentLength);
    name = `${prefix}${truncatedLast}_${hash}`;
  }

  return name;
};

/**
 * Create a simple hash from a string for uniqueness
 */
const createSimpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36).substring(0, 6);
};

import { Command } from 'commander';
import { Abi } from 'viem';
import { callReadMethod, ReadContract } from 'utils';

export type ReadProgramCommandConfig = {
  [fnName: string]: {
    name?: string;
    description?: string;
    arguments?: {
      [argName: string]: {
        name?: string;
        description?: string;
        modifier?: (value: string) => any;
      };
    };
  };
};

/**
 * Generates a CLI command based on the provided ABI.
 * Only functions with stateMutability === 'view' or 'pure' are taken.
 * Allows adding custom descriptions.
 */
export const generateVaultCommands = <T>(
  abi: Abi,
  createContract: (address: T) => ReadContract,
  command: Command,
  commandConfig: ReadProgramCommandConfig,
): Command => {
  // Filter only view/pure functions
  const readOnlyFunctions = abi.filter(
    (entry: any) =>
      entry.type === 'function' &&
      (entry.stateMutability === 'view' || entry.stateMutability === 'pure') &&
      entry.name,
  );

  // Generate subcommands
  readOnlyFunctions.forEach((fn: any) => {
    const fnName = fn.name;
    const inputs = fn.inputs || [];

    // Search for a custom description for this function
    const configForFn = commandConfig[fnName];
    // Custom command name if specified
    const commandName = configForFn?.name || fnName;
    // Command description
    const commandDescription =
      configForFn?.description ||
      `Calls the read-only function "${fnName}" on the contract.`;

    // Create a subcommand by function name
    const fnCommand = command
      .command(commandName)
      .description(commandDescription);

    // The first argument is the contract address
    fnCommand.argument('<address>', 'Contract address');

    // Add arguments for each function parameter
    inputs.forEach((input: any, index: number) => {
      const abiArgName = input.name || `param${index}`;
      // Check if there is a custom description for this argument
      const configArg = configForFn?.arguments?.[abiArgName];
      // If a custom name is specified, use it as the name
      const cliArgName = configArg?.name || abiArgName;
      // If a custom description is specified, use it, otherwise use the default
      const cliArgDesc =
        configArg?.description || `Parameter of type ${input.type}`;

      const parseFn =
        typeof configArg?.modifier === 'function'
          ? configArg.modifier
          : undefined;

      // Create an argument using the custom name and description

      if (parseFn) fnCommand.argument(`<${cliArgName}>`, cliArgDesc, parseFn);
      else fnCommand.argument(`<${cliArgName}>`, cliArgDesc);
    });

    fnCommand.action(async (...args: any[]) => {
      try {
        // First part of args is the contract address
        const address = args[0];
        // Function parameters start from the second element
        const fnArgs =
          inputs.length > 0 ? args.slice(1, args.length - 1) : undefined;

        const contract = createContract(address);

        if (fnArgs) await callReadMethod(contract, fnName, fnArgs);
        else await callReadMethod(contract, fnName);
      } catch (error) {
        console.error(`Error calling function ${fnName}:`, error);
        process.exit(1);
      }
    });
  });

  return command;
};

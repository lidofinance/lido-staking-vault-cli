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

export function generateReadCommands<T>(
  abi: Abi,
  createContract: (address: T) => ReadContract,
  command: Command,
  commandConfig: ReadProgramCommandConfig,
): Command;
export function generateReadCommands(
  abi: Abi,
  createContractAsync: () => Promise<ReadContract>,
  command: Command,
  commandConfig: ReadProgramCommandConfig,
): Command;

/**
 * Generates a CLI command based on the provided ABI.
 * Only functions with stateMutability === 'view' or 'pure' are taken.
 * Allows adding custom descriptions.
 */
// eslint-disable-next-line func-style
export function generateReadCommands<T>(
  abi: Abi,
  createContractOrContract:
    | ((address: T) => ReadContract)
    | (() => Promise<ReadContract>),
  command: Command,
  commandConfig: ReadProgramCommandConfig,
): Command {
  // Filter only view/pure functions
  const readOnlyFunctions = abi.filter(
    (entry: any) =>
      entry.type === 'function' &&
      (entry.stateMutability === 'view' || entry.stateMutability === 'pure') &&
      entry.name,
  );

  // Check if the contract is already created
  const isNeedsAddress =
    (
      createContractOrContract as
        | ((address: T) => ReadContract)
        | (() => Promise<ReadContract>)
    ).length === 1;

  const methods: string[] = [];

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

    let fnCommand: Command;
    // Create a subcommand by function name
    if (methods.includes(commandName)) {
      fnCommand = command
        .command(`${commandName}${inputs[0].name}`)
        .description(commandDescription);
    } else {
      fnCommand = command.command(commandName).description(commandDescription);
    }
    methods.push(fnName);

    // If the contract needs an address, add the <address> argument
    if (isNeedsAddress) {
      fnCommand.argument('<address>', 'Contract address');
    }

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

    fnCommand.action(async (...cliArgs: any[]) => {
      try {
        let contract: ReadContract;
        let fnArgs: any[] | undefined;

        if (isNeedsAddress) {
          // The first argument is the contract address
          const address = cliArgs[0];
          // The rest are the function arguments
          fnArgs = cliArgs.slice(1);
          // Create the contract
          contract = (createContractOrContract as (address: T) => ReadContract)(
            address,
          );
        } else {
          // Create the contract async
          contract = await (
            createContractOrContract as () => Promise<ReadContract>
          )();
          fnArgs = cliArgs; // all the passed arguments are the function arguments
        }

        fnArgs = inputs.length > 0 ? fnArgs : undefined;

        if (fnArgs) await callReadMethod(contract, fnName, fnArgs);
        else await callReadMethod(contract, fnName);
      } catch (error) {
        console.error(`Error calling function ${fnName}:`, error);
        process.exit(1);
      }
    });
  });

  return command;
}

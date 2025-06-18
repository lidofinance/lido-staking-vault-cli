import { Command } from 'commander';
import { Abi, AbiFunction } from 'viem';
import { callReadMethod, ReadContract, stringToAddress } from 'utils';

// Enhanced typing for extracting function names from ABI
type ExtractFunctionNames<T extends Abi> = {
  [K in keyof T]: T[K] extends { type: 'function'; name: infer N }
    ? N extends string
      ? N
      : never
    : never;
}[number];

export type ReadProgramCommandConfig<T extends Abi> = {
  [K in ExtractFunctionNames<T>]?: {
    hidden?: boolean;
    name?: string;
    description?: string;
    aliases?: string[];
    arguments?: {
      [argName: string]: {
        name?: string;
        description?: string;
        modifier?: (value: string) => any;
      };
    };
  };
};

export function generateReadCommands<T, U extends Abi>(
  abi: U,
  createContract: (address: T) => ReadContract,
  command: Command,
  commandConfig: ReadProgramCommandConfig<U>,
): Command;
export function generateReadCommands<U extends Abi>(
  abi: Abi,
  createContractAsync: () => Promise<ReadContract>,
  command: Command,
  commandConfig: ReadProgramCommandConfig<U>,
): Command;

/**
 * Generates a CLI command based on the provided ABI.
 * Only functions with stateMutability === 'view' or 'pure' are taken.
 * Allows adding custom descriptions.
 */
// eslint-disable-next-line func-style
export function generateReadCommands<T, U extends Abi>(
  abi: U,
  createContractOrContract:
    | ((address: T) => ReadContract)
    | (() => Promise<ReadContract>),
  command: Command,
  commandConfig: ReadProgramCommandConfig<U>,
): Command {
  // Filter only view/pure functions with proper typing
  const readOnlyFunctions = abi.filter(
    (entry): entry is AbiFunction =>
      entry.type === 'function' &&
      (entry.stateMutability === 'view' || entry.stateMutability === 'pure') &&
      'name' in entry &&
      entry.name !== undefined,
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
  readOnlyFunctions.forEach((fn: AbiFunction) => {
    const fnName = fn.name;
    const inputs = fn.inputs || [];

    // Search for a custom description for this function
    const configForFn = commandConfig[fnName as ExtractFunctionNames<U>];
    if (configForFn?.hidden) return;

    // Custom command name if specified
    const commandName = methods.includes(fnName)
      ? `${fnName}${inputs[0]?.name || '0'}`
      : configForFn?.name || fnName;

    // Command description
    const commandDescription =
      configForFn?.description ||
      `Calls the read-only function "${fnName}" on the contract.`;

    const aliases = configForFn?.aliases || [];

    // Create a subcommand by function name
    const fnCommand = command
      .command(commandName)
      .aliases(aliases)
      .description(commandDescription);
    methods.push(fnName);

    // If the contract needs an address, add the <address> argument
    if (isNeedsAddress) {
      fnCommand.argument('<address>', 'Contract address', stringToAddress);
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

        fnArgs = inputs.length > 0 ? fnArgs.slice(0, inputs.length) : undefined;

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

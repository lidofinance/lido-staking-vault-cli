import { Command } from 'commander';

export const getCommandsJson = (program: Command) => {
  return JSON.stringify(
    program.commands.map((x: any) => {
      const command = `${x.name()} ${x.alias() !== undefined ? x.alias() : ''}${
        x.registeredArguments
          ?.map((y: any) => String.raw`\<${y.name()}>`)
          .join(' ') || ''
      }`;
      return {
        Command: command,
        Description: x.description(),
      };
    }),
  );
};

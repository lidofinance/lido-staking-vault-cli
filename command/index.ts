import { Command } from "commander";
import { setAdvancedConfig } from "@features";
import { validateConfig } from "@utils";
import { importConfigFile } from "@configs";

export const program = new Command()

program
  .option("-c, --config <config>", "link to config file")
  .action(async ({ config }: { config: string }) => {
    console.log('++++++++++++++++++++++++++++')
    console.log('HERE')
    console.log('++++++++++++++++++++++++++++')
    const file = importConfigFile(config);
    if (validateConfig(file)) {
      await setAdvancedConfig(file);
    } else {
      program.error('Config file not valid', { exitCode: 1 });
    }
  });

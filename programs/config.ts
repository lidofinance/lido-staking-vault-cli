import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { program } from 'command';
import { validateConfig, logInfo } from 'utils';
import { Config } from 'types';

program
  .command('conf <path>')
  .description('Load and validate a JSON configuration file')
  .action((filePath) => {
    try {
      const absolutePath = resolve(filePath);
      if (!existsSync(absolutePath)) {
        program.error(`File not found: ${absolutePath}`, { exitCode: 1 });
      }

      const rawData = readFileSync(absolutePath, 'utf-8');
      const config = JSON.parse(rawData);

      const errors = validateConfig(config);
      const errorKeys = Object.keys(errors);
      if (errorKeys.length > 0) {
        errorKeys.forEach((key) =>
          program.error(`${key} - ${errors[key as keyof Config]}`),
        );
        process.exit(1);
      }

      logInfo('Configuration is valid!');
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error loading or validating JSON file:', error.message);
      }
      process.exit(1);
    }
  });

#! /usr/bin/env node

import { program } from './command/index.js';
import { logError } from './utils/logging/console.js';
import './programs/index.js';

program.parseAsync(process.argv).catch((error) => {
  logError('CLI Error:', error);
  process.exit(1);
});

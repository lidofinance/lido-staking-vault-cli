#! /usr/bin/env node

import { program } from './command/index.js';
import './programs/index.js';

program.parseAsync(process.argv).catch((error) => {
  console.error('CLI Error:', error);
  process.exit(1);
});

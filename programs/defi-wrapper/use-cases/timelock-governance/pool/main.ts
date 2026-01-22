import { timelockGovernance } from '../main.js';

export const pool = timelockGovernance
  .command('pool')
  .alias('p')
  .description('pool timelock governance commands');

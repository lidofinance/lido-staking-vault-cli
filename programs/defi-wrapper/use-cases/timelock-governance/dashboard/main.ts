import { timelockGovernance } from '../main.js';

export const dashboard = timelockGovernance
  .command('dashboard')
  .alias('d')
  .description('dashboard timelock governance commands');

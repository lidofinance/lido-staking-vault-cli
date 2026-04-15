import { timelockGovernance } from '../main.js';

export const strategy = timelockGovernance
  .command('strategy')
  .alias('s')
  .description('strategy timelock governance commands');

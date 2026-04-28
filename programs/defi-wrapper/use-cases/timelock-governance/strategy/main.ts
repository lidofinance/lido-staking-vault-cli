import { timelockGovernance } from '../main.js';

export const strategyTimelock = timelockGovernance
  .command('strategy')
  .alias('s')
  .description('strategy timelock governance commands');

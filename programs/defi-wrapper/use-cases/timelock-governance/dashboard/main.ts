import { timelockGovernance } from '../main.js';

export const dashboardTimelockGovernance = timelockGovernance
  .command('dashboard')
  .alias('d')
  .description('dashboard timelock governance commands');

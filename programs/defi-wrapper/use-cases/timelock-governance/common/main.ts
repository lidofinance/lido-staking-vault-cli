import { timelockGovernance } from '../main.js';

export const common = timelockGovernance
  .command('common')
  .alias('c')
  .description('common timelock governance commands');

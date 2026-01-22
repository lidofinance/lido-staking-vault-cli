import { timelockGovernance } from '../main.js';

export const withdrawalQueue = timelockGovernance
  .command('withdrawal-queue')
  .alias('wq')
  .description('withdrawal queue timelock governance commands');

import { timelockGovernance } from '../main.js';

export const withdrawalQueueTimelockGovernance = timelockGovernance
  .command('withdrawal-queue')
  .alias('wq')
  .description('withdrawal queue timelock governance commands');

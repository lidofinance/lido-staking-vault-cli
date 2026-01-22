import { timelockGovernance } from '../main.js';

export const proxy = timelockGovernance
  .command('proxy')
  .alias('px')
  .description('proxy timelock governance commands');

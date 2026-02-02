import { useCases } from '../main.js';

export const timelockGovernance = useCases
  .command('timelock-governance')
  .alias('tg')
  .description('timelock governance helpers');

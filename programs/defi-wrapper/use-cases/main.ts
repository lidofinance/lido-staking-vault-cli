import { defiWrapper } from '../main.js';

export const useCases = defiWrapper
  .command('use-cases')
  .alias('uc')
  .description('defi wrapper use cases commands');

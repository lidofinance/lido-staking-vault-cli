import { useCases } from '../main.js';

export const health = useCases
  .command('health')
  .alias('h')
  .description('health monitoring commands for stv-steth-pool positions');

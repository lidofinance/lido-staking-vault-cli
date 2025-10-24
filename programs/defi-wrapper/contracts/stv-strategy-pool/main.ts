import { defiWrapperContracts } from '../main.js';

export const stvStrategyPool = defiWrapperContracts
  .command('stv-strategy-pool')
  .alias('stv-strategy')
  .description('stv strategy pool contract');

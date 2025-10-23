import { defiWrapperContracts } from '../main.js';

export const stvPool = defiWrapperContracts
  .command('stv-pool')
  .alias('stv')
  .description('stv pool contract');

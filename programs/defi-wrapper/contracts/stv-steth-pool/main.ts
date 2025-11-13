import { defiWrapperContracts } from '../main.js';

export const stvStethPool = defiWrapperContracts
  .command('stv-steth-pool')
  .alias('stv-steth')
  .description('stv steth pool contract');

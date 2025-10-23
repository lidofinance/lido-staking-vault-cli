import { defiWrapperContracts } from '../main.js';

export const withdrawalQueue = defiWrapperContracts
  .command('withdrawal-queue')
  .alias('wq')
  .description('withdrawal queue contract');

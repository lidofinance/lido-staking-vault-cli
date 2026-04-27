import { defiWrapperContracts } from '../main.js';

export const strategy = defiWrapperContracts
  .command('strategy')
  .alias('str')
  .description('strategy contract');

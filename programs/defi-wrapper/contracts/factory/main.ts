import { defiWrapperContracts } from '../main.js';

export const factory = defiWrapperContracts
  .command('factory')
  .alias('f')
  .description('factory contract');

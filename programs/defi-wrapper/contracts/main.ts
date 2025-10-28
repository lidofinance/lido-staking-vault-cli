import { defiWrapper } from '../main.js';

export const defiWrapperContracts = defiWrapper
  .command('contracts')
  .alias('c')
  .description('defi wrapper contracts commands');

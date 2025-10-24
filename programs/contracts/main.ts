import { program } from 'command';

export const contracts = program
  .command('contracts')
  .alias('c')
  .description('contracts commands');

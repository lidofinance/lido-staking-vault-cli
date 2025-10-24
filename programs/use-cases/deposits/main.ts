import { program } from 'command';

export const deposits = program
  .command('deposits')
  .alias('d')
  .description('deposits utilities');

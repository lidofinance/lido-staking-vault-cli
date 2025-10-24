import { program } from 'command';

export const report = program
  .command('report')
  .alias('r')
  .description('report utilities');

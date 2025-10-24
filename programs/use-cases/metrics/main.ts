import { program } from 'command';

export const metrics = program
  .command('metrics')
  .alias('m')
  .description('metrics');

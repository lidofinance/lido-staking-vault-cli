import { program } from 'command';

export const devTools = program
  .command('dev-tools')
  .alias('dt')
  .description('developer tools commands');

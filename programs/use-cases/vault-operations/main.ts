import { program } from 'command';

export const vaultOperations = program
  .command('vault-operations')
  .alias('vo')
  .description('vault operations utilities');

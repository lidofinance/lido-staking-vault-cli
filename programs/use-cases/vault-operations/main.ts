import { program } from 'command';

export const vaultOperations = program
  .command('vault-operations')
  .alias('vop')
  .description('vault operations utilities');

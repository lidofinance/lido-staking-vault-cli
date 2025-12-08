import { useCases } from '../main.js';

export const wrapperOperations = useCases
  .command('wrapper-operations')
  .alias('wo')
  .description('defi wrapper operations utilities');

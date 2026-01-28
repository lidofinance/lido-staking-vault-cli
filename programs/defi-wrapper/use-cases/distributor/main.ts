import { useCases } from '../main.js';

export const distributorUseCases = useCases
  .command('distributor')
  .alias('d')
  .description(
    'commands for managing side token distributions via Merkle Trees',
  );

import { devTools } from '../main.js';

export const anvil = devTools
  .command('anvil')
  .description('control local Ethereum node using Foundry Anvil');

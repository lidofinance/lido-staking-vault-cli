import { generateReadCommands } from 'utils';
import { OperatorGridAbi } from 'abi';
import { getOperatorGridContract } from 'contracts';

import { operatorGrid } from './main.js';
import { readCommandConfig } from './config.js';

generateReadCommands(
  OperatorGridAbi,
  getOperatorGridContract,
  operatorGrid,
  readCommandConfig,
);

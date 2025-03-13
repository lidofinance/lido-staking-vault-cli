import { generateReadCommands } from 'utils';
import { PredepositGuaranteeAbi } from 'abi';

import { pdg } from './main.js';
import { readCommandConfig } from './config.js';
import { getPredepositGuaranteeContract } from 'contracts';

generateReadCommands(
  PredepositGuaranteeAbi,
  getPredepositGuaranteeContract,
  pdg,
  readCommandConfig,
);

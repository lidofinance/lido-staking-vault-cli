import { ReadProgramCommandConfig } from 'utils';

import { readCommandConfig as dashboardReadCommandConfig } from 'programs/dashboard/config.js';

export const readCommandConfig: ReadProgramCommandConfig = {
  ...dashboardReadCommandConfig,
  nodeOperatorFeeBP: {
    name: 'no-fee',
    description: 'get node operator fee in basis points',
  },
  nodeOperatorFeeClaimedReport: {
    name: 'no-fee-report',
    description: 'get node operator fee claimed report',
  },
  nodeOperatorUnclaimedFee: {
    name: 'no-unclaimed-fee',
    description: `Returns the accumulated unclaimed node operator fee in ether`,
  },
  curatorUnclaimedFee: {
    name: 'cf-unclaimed',
    description: `Returns the accumulated unclaimed curator fee in ether`,
  },
};

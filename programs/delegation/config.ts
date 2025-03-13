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
    description: `Returns the accumulated unclaimed node operator fee in ether,
                calculated as: U = (R * F) / T
                where:
                - U is the node operator unclaimed fee;
                - R is the StakingVault rewards accrued since the last node operator fee claim;
                - F is nodeOperatorFeeBP
                - T is the total basis points, 10,000.`,
  },
  curatorUnclaimedFee: {
    name: 'cf-unclaimed',
    description: `Returns the accumulated unclaimed curator fee in ether,
                calculated as: U = (R * F) / T
                where:
                - U is the curator unclaimed fee;
                - R is the StakingVault rewards accrued since the last curator fee claim;
                - F is curatorFeeBP
                - T is the total basis points, 10,000.`,
  },
};

import { LazyOracleAbi } from 'abi';
import { ReadProgramCommandConfig, stringToAddress } from 'utils';

export const readCommandConfig: ReadProgramCommandConfig<typeof LazyOracleAbi> =
  {
    batchVaultsInfo: {
      name: 'batch-vaults-info',
      description: 'get batch vaults info',
      arguments: {
        _offset: {
          name: 'offset',
          description: 'offset',
          modifier: (value) => BigInt(value),
        },
        _limit: {
          name: 'limit',
          description: 'limit',
          modifier: (value) => BigInt(value),
        },
      },
    },
    latestReportData: {
      name: 'latest-report-data',
      aliases: ['lrd'],
      description: 'get latest report data',
    },
    latestReportTimestamp: {
      name: 'latest-report-timestamp',
      aliases: ['lrt'],
      description: 'get latest report timestamp',
    },
    maxRewardRatioBP: {
      name: 'max-reward-ratio-bp',
      aliases: ['mrr'],
      description: 'get max reward ratio',
    },
    quarantinePeriod: {
      name: 'quarantine-period',
      aliases: ['qp'],
      description: 'get quarantine period',
    },
    vaultQuarantine: {
      name: 'vault-quarantine',
      aliases: ['vq'],
      description: 'get vault quarantine',
      arguments: {
        _vault: {
          name: 'vault',
          description: 'vault address',
          modifier: (value) => stringToAddress(value),
        },
      },
    },
    vaultsCount: {
      name: 'vaults-count',
      aliases: ['vc'],
      description: 'get vaults count',
    },
    maxLidoFeeRatePerSecond: {
      name: 'max-lido-fee-rate-per-second',
      aliases: ['max-lfs'],
      description: 'get the max Lido fee rate per second, in ether',
    },
  };

import { test as base } from '@playwright/test';
import { EthereumNodeService } from '@lidofinance/wallets-testing-nodes';
import { getStandConfig } from '../config';
import { DefaultVaultData, getDefaultVaultData } from '../testData/roles.data';

type Fixtures = object;

export const test = base.extend<
  Fixtures,
  {
    ethereumNodeService: EthereumNodeService;
    defaultVaultData: DefaultVaultData;
    nodeRunOptions: string[];
  }
>({
  // nodeRunOptions param configured via globalSetup
  nodeRunOptions: [
    ['--state-interval=1'], // default runOptions
    { scope: 'worker' },
  ],
  ethereumNodeService: [
    async ({ nodeRunOptions }, use) => {
      const { networkConfig, nodeConfig } = getStandConfig();
      const ethereumNodeService = new EthereumNodeService({
        ...nodeConfig,
        runOptions: nodeRunOptions,
        rpcUrl: networkConfig.rpcUrl,
      });
      await ethereumNodeService.startNode();

      await use(ethereumNodeService);

      // Teardown will be call only when all tests done or when test failed.
      await ethereumNodeService.stopNode();
    },
    { scope: 'worker' },
  ],
  defaultVaultData: [
    async ({ ethereumNodeService }, use) => {
      await use(getDefaultVaultData(ethereumNodeService));
    },
    { scope: 'worker' },
  ],
});

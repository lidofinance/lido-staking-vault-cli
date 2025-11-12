import { test as base } from '@playwright/test';
import { EthereumNodeService } from '@lidofinance/wallets-testing-nodes';
import { getStandConfig } from '../config/env.config';
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
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      // use fork state prepared in globalSetup.ts with load option to not save it per tests
      await use(['--load-state=./state.json']); // default runOptions
    },
    { scope: 'worker' },
  ],
  ethereumNodeService: [
    // eslint-disable-next-line
    async ({ nodeRunOptions }, use) => {
      const rpcUrl = getStandConfig().networkConfig.rpcUrl;
      const ethereumNodeService = new EthereumNodeService({
        rpcUrl: rpcUrl,
        // not required for CLI tests
        rpcUrlToMock: '',
        runOptions: nodeRunOptions,
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

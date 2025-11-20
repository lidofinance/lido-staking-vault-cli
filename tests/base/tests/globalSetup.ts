import { test } from './test.fixture';
import { getStandConfig } from '../config/env.config';
import {
  buildAdditionalRoles,
  getPermissionRole,
  NO_ROLES,
  PERMISSION_ROLES,
  ROLES,
} from '../testData/roles.data';
import { lsvCLI } from '../utils/lsvCLI';

// For globalSetup we need to save fork state for continue tests state
test.use({
  nodeRunOptions: ['--dump-state=./state.json', '--state-interval=1'],
});

const CONFIRM_EXPIRY = 86400;
const NO_FEE_RATE = 100;

test('Create defaultVault', async ({
  ethereumNodeService,
  defaultVaultData,
}) => {
  await test.step('Setup env for CLI', async () => {
    if (ethereumNodeService.state) {
      process.env.PRIVATE_KEY = ethereumNodeService.getAccount(0).secretKey;
      process.env.DEPLOYED = `../../../configs/${getStandConfig().deployed}`;
      process.env.EL_URL = ethereumNodeService.state.nodeUrl;
    } else throw new Error('EthereumNodeService node ready');
  });

  const { roles } = defaultVaultData;

  const vaultData = await test.step('Create vault && configure', async () => {
    const additionalRoles = buildAdditionalRoles(ethereumNodeService);

    return await lsvCLI.createVault({
      defaultAdmin: roles.defaultAdmin.address,
      nodeOperator: roles.nodeOperator.address,
      nodeOperatorManager: roles.nodeOperatorManager.address,
      confirmExpiry: CONFIRM_EXPIRY,
      nodeOperatorFeeRate: NO_FEE_RATE,
      roles: additionalRoles,
    });
  });

  // Look out "🧑‍🔧 Debugging Tip" point for debug in Readme.md
  // console.log(`Vault address ${vaultData.vaultAddress}`);
  // console.log(`Dashboard address ${vaultData.dashboardAddress}`);

  await test.step('Grant additional NO related roles', async () => {
    // set PRIVATE_KEY to NOM
    process.env.PRIVATE_KEY = ethereumNodeService.getAccount(
      getPermissionRole(ROLES.NODE_OPERATOR_MANAGER).index,
    ).secretKey;

    await lsvCLI.grantRole(
      vaultData.dashboardAddress,
      Array.from(PERMISSION_ROLES.entries())
        .filter(([role]) => NO_ROLES.includes(role))
        .map(([, { index, keccak }]) => ({
          account: ethereumNodeService.getAccount(index).address,
          role: keccak,
        })),
    );

    // pass default vault address to pw tests process
    process.env.VAULT_ADDRESS = vaultData.vaultAddress;
    process.env.DASHBOARD_ADDRESS = vaultData.dashboardAddress;
  });
});

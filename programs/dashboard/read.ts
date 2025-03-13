import { getDashboardContract } from 'contracts';
import { Address } from 'viem';
import { DashboardAbi } from 'abi';
import { generateReadCommands, textPrompt } from 'utils';
import { getBaseInfo } from 'features';

import { dashboard } from './main.js';
import { readCommandConfig } from './config.js';

dashboard
  .command('info')
  .description('get dashboard base info')
  .option('-a, --address <address>', 'dashboard address')
  .action(async ({ address }: { address: Address }) => {
    let dashboardAddress = address;

    if (!dashboardAddress) {
      const answer = await textPrompt('Enter dashboard address', 'address');
      dashboardAddress = answer.address;

      if (!dashboardAddress) {
        console.info('Command cancelled');
        return;
      }
    }

    const contract = getDashboardContract(dashboardAddress);

    await getBaseInfo(contract);
  });

generateReadCommands(
  DashboardAbi,
  getDashboardContract,
  dashboard,
  readCommandConfig,
);

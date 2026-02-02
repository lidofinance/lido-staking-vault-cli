import { Address, erc20Abi, formatUnits, getContract } from 'viem';
import { Option } from 'commander';
import { logInfo, getCommandsJson, stringToAddress, logTable } from 'utils';
import {
  getDistributorContract,
  getStvPoolContract,
} from 'contracts/defi-wrapper/index.js';

import { distributorUseCases } from './main.js';
import { getPublicClient } from 'providers/wallet.js';

const distributorRead = distributorUseCases
  .command('read')
  .aliases(['r'])
  .description('distributor operations read commands');

distributorRead.addOption(new Option('-cmd2json'));
distributorRead.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(distributorRead));
  process.exit();
});

distributorRead
  .command('state')
  .description('show current distributor state')
  .argument('<pool address>', 'pool contract address', stringToAddress)
  .action(async (address: Address) => {
    const publicClient = await getPublicClient();
    const poolContract = await getStvPoolContract(address);
    const distributorAddress = await poolContract.read.DISTRIBUTOR();
    const distributorContract =
      await getDistributorContract(distributorAddress);

    const [
      DEFAULT_ADMIN_ROLE,
      MANAGER_ROLE,
      cid,
      root,
      lastProcessedBlock,
      tokens,
    ] = await Promise.all([
      distributorContract.read.DEFAULT_ADMIN_ROLE(),
      distributorContract.read.MANAGER_ROLE(),
      distributorContract.read.cid(),
      distributorContract.read.root(),
      distributorContract.read.lastProcessedBlock(),
      distributorContract.read.getTokens(),
    ]);

    const [admins, managers] = await Promise.all([
      distributorContract.read.getRoleMembers([DEFAULT_ADMIN_ROLE]),
      distributorContract.read.getRoleMembers([MANAGER_ROLE]),
    ]);

    const tokenBalances = await Promise.allSettled(
      tokens.map(async (tokenAddress) => {
        const tokenContract = getContract({
          address: tokenAddress,
          abi: erc20Abi,
          client: publicClient,
        });
        const balance = await tokenContract.read.balanceOf([
          distributorAddress,
        ]);
        const decimals = await tokenContract.read.decimals();
        const name = await tokenContract.read.name();
        const symbol = await tokenContract.read.symbol();

        return {
          name,
          symbol,
          balance: formatUnits(balance, decimals),
          decimals,
          balanceRaw: balance,
        };
      }),
    );

    logTable({
      data: [
        ['Distributor Address', distributorAddress],
        ['Pool Address', address],
        ['Admins', admins.length.toString()],
        ...admins.map((addr, index) => [`Admin ${index + 1}`, addr]),
        ['Managers', managers.length.toString()],
        ...managers.map((addr, index) => [`Manager ${index + 1}`, addr]),
        ['Tokens Supported', tokens.length.toString()],
        ...tokens.flatMap((addr, index) => {
          const table = [[`Token ${index + 1} Address`, addr]];

          if (tokenBalances[index]?.status === 'fulfilled') {
            const { balance, decimals, balanceRaw, name, symbol } =
              tokenBalances[index].value;
            table.push(
              [`Token ${index + 1} Name`, name],
              [`Token ${index + 1} Symbol`, symbol],
              [`Token ${index + 1} Balance`, balance],
              [`Token ${index + 1} Decimals`, decimals.toString()],
              [`Token ${index + 1} Balance(WEI)`, balanceRaw.toString()],
            );
          } else {
            table.push([
              `Token ${index + 1} Balance`,
              'Error fetching balance',
            ]);
          }

          return table;
        }),
        ['CID', cid],
        ['Merkle Root', root],
        ['Last Processed Block', lastProcessedBlock.toString()],
      ],
    });
  });

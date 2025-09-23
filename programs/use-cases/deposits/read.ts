import { Address, formatEther, Hex } from 'viem';
import { Option } from 'commander';

import {
  getPdgBaseInfo,
  getPdgRoles,
  getValidatorStatus,
  specifyNodeOperatorAddress,
  chooseVaultAndGetDashboard,
} from 'features';
import { getPredepositGuaranteeContract } from 'contracts';
import { getAccount } from 'providers';

import {
  callReadMethodSilent,
  getCommandsJson,
  logInfo,
  logResult,
  stringToAddress,
} from 'utils';

import { deposits } from './main.js';

const depositsRead = deposits
  .command('read')
  .aliases(['r'])
  .description('vault operations read commands');

depositsRead.addOption(new Option('-cmd2json'));
depositsRead.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(depositsRead));
  process.exit();
});

depositsRead
  .command('info')
  .description('get PredepositGuarantee base info')
  .action(async () => {
    await getPdgBaseInfo();
  });

depositsRead
  .command('roles')
  .description('get PredepositGuarantee roles')
  .action(async () => {
    await getPdgRoles();
  });

depositsRead
  .command('validator-status')
  .aliases(['v-status'])
  .description('get validator status')
  .argument('<validatorPubkey>', 'validator pubkey')
  .action(async (validatorPubkey: Hex) => {
    await getValidatorStatus(validatorPubkey);
  });

depositsRead
  .command('no-balance')
  .aliases(['no-bal'])
  .description(
    'get total,locked & unlocked (the amount of ether that NO can lock for predeposit or withdraw) balances for the NO in PDG',
  )
  .action(async () => {
    const pdgContract = await getPredepositGuaranteeContract();
    const nodeOperator = await specifyNodeOperatorAddress();

    const totalBalance = await callReadMethodSilent(
      pdgContract,
      'nodeOperatorBalance',
      [nodeOperator],
    );
    const unlockedBalance = await callReadMethodSilent(
      pdgContract,
      'unlockedBalance',
      [nodeOperator],
    );

    logResult({
      data: [
        ['Total', `${formatEther(totalBalance.total)} ETH`],
        ['Locked', `${formatEther(totalBalance.locked)} ETH`],
        ['Unlocked', `${formatEther(unlockedBalance)} ETH`],
      ],
    });
  });

depositsRead
  .command('no-info')
  .description('get info about the NO in PDG')
  .action(async () => {
    const currentAccount = await getAccount();

    const pdgContract = await getPredepositGuaranteeContract();
    const nodeOperator = await specifyNodeOperatorAddress();

    const totalBalance = await callReadMethodSilent(
      pdgContract,
      'nodeOperatorBalance',
      [nodeOperator],
    );
    const unlockedBalance = await callReadMethodSilent(
      pdgContract,
      'unlockedBalance',
      [nodeOperator],
    );
    const depositor = await callReadMethodSilent(
      pdgContract,
      'nodeOperatorDepositor',
      [nodeOperator],
    );
    const guarantor = await callReadMethodSilent(
      pdgContract,
      'nodeOperatorGuarantor',
      [nodeOperator],
    );
    const isYourselfDepositor = depositor === currentAccount.address;
    const isYourselfGuarantor = guarantor === currentAccount.address;

    logResult({
      data: [
        ['Total', `${formatEther(totalBalance.total)} ETH`],
        ['Locked', `${formatEther(totalBalance.locked)} ETH`],
        ['Unlocked', `${formatEther(unlockedBalance)} ETH`],
        ['Depositor', `${depositor} ${isYourselfDepositor ? '(you)' : ''}`],
        ['Guarantor', `${guarantor} ${isYourselfGuarantor ? '(you)' : ''}`],
      ],
    });
  });

depositsRead
  .command('pending-predeposits')
  .aliases(['pd'])
  .description(
    'get the current amount of ether that is predeposited to a given vault',
  )
  .option('-v, --vault <string>', 'vault address', stringToAddress)
  .action(async ({ vault }: { vault: Address }) => {
    const { vault: vaultAddress } = await chooseVaultAndGetDashboard({
      vault,
    });
    const contract = await getPredepositGuaranteeContract();
    const pendingPredeposits = await callReadMethodSilent(
      contract,
      'pendingPredeposits',
      [vaultAddress],
    );

    logResult({
      data: [
        ['Pending Predeposits amount, ETH', formatEther(pendingPredeposits)],
      ],
    });
  });

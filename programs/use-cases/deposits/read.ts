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
import { checkPdgIsPaused } from 'features';

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

    const totalBalance = await callReadMethodSilent({
      contract: pdgContract,
      methodName: 'nodeOperatorBalance',
      payload: [[nodeOperator]],
    });
    const unlockedBalance = await callReadMethodSilent({
      contract: pdgContract,
      methodName: 'unlockedBalance',
      payload: [[nodeOperator]],
    });

    logResult({
      data: [
        ['Total', `${formatEther(totalBalance.total)} ETH`],
        ['Locked', `${formatEther(totalBalance.locked)} ETH`],
        ['Unlocked', `${formatEther(unlockedBalance)} ETH`],
      ],
    });

    await checkPdgIsPaused(pdgContract);
  });

depositsRead
  .command('no-info')
  .description('get info about the NO in PDG')
  .action(async () => {
    const currentAccount = await getAccount();

    const pdgContract = await getPredepositGuaranteeContract();
    const nodeOperator = await specifyNodeOperatorAddress();

    const totalBalance = await callReadMethodSilent({
      contract: pdgContract,
      methodName: 'nodeOperatorBalance',
      payload: [[nodeOperator]],
    });
    const unlockedBalance = await callReadMethodSilent({
      contract: pdgContract,
      methodName: 'unlockedBalance',
      payload: [[nodeOperator]],
    });
    const depositor = await callReadMethodSilent({
      contract: pdgContract,
      methodName: 'nodeOperatorDepositor',
      payload: [[nodeOperator]],
    });
    const guarantor = await callReadMethodSilent({
      contract: pdgContract,
      methodName: 'nodeOperatorGuarantor',
      payload: [[nodeOperator]],
    });
    const claimableRefund = await callReadMethodSilent({
      contract: pdgContract,
      methodName: 'claimableRefund',
      payload: [[guarantor]],
    });
    const isYourselfDepositor = depositor === currentAccount.address;
    const isYourselfGuarantor = guarantor === currentAccount.address;

    logResult({
      data: [
        ['Total', `${formatEther(totalBalance.total)} ETH`],
        ['Locked', `${formatEther(totalBalance.locked)} ETH`],
        ['Unlocked', `${formatEther(unlockedBalance)} ETH`],
        ['Depositor', `${depositor} ${isYourselfDepositor ? '(you)' : ''}`],
        ['Guarantor', `${guarantor} ${isYourselfGuarantor ? '(you)' : ''}`],
        ['Claimable Refund', `${formatEther(claimableRefund)} ETH`],
      ],
    });

    await checkPdgIsPaused(pdgContract);
  });

depositsRead
  .command('pending-activations')
  .aliases(['pd'])
  .description(
    'get the number of validators in PREDEPOSITED and PROVEN states but not ACTIVATED yet',
  )
  .option('-v, --vault <string>', 'vault address', stringToAddress)
  .action(async ({ vault }: { vault: Address }) => {
    const { vault: vaultAddress } = await chooseVaultAndGetDashboard({
      vault,
    });
    const contract = await getPredepositGuaranteeContract();
    const pendingActivations = await callReadMethodSilent({
      contract,
      methodName: 'pendingActivations',
      payload: [[vaultAddress]],
    });

    logResult({
      data: [['Pending Activations of validators', pendingActivations]],
    });

    await checkPdgIsPaused(contract);
  });

import { Option } from 'commander';
import { program } from 'command';
import { getVotingContract } from 'contracts';
import { voteLastVoting } from 'features';
import { callReadMethod, logInfo, getCommandsJson } from 'utils';

const voting = program.command('vote').description('voting contract');
voting.addOption(new Option('-cmd2json'));
voting.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(voting));
  process.exit();
});

voting.command('get-lv').action(async () => {
  const { contract } = getVotingContract();

  const tx = await callReadMethod(contract, 'votesLength');

  logInfo({ 'Votes length': tx });
});

voting.command('connect-and-vote').action(async () => await voteLastVoting());

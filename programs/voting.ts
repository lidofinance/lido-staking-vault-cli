import { Address } from 'viem';
import { program } from 'command';
import { getVaultHubContract, getVotingContract } from 'contracts';
import { voteLastVoting } from 'features';
import { callWriteMethodWithReceipt, callReadMethod, logInfo } from 'utils';

const voting = program.command('vote').description('voting contract');

voting
  .command('connect-vault')
  .description('vote and connect vault to the hub')
  .description('connects a vault to the hub (vault master role needed)')
  .argument('<address>', 'vault address')
  .argument(
    '<shareLimit>',
    'maximum number of stETH shares that can be minted by the vault',
  )
  .argument('<reserveRatio>', 'minimum Reserve ratio in basis points')
  .argument(
    '<reserveRatioThreshold>',
    'reserve ratio that makes possible to force rebalance on the vault (in basis points)',
  )
  .argument('<treasuryFeeBP>', 'treasury fee in basis points')
  .action(
    async (
      address: Address,
      shareLimit: bigint,
      reserveRatio: bigint,
      reserveRatioThreshold: bigint,
      treasuryFeeBP: bigint,
    ) => {
      const contract = await getVaultHubContract();

      await callWriteMethodWithReceipt(contract, 'connectVault', [
        address,
        shareLimit,
        reserveRatio,
        reserveRatioThreshold,
        treasuryFeeBP,
      ]);
    },
  );

voting.command('get-lv').action(async () => {
  const { contract } = getVotingContract();

  const tx = await callReadMethod(contract, 'votesLength');

  logInfo({ 'Votes length': tx });
});

voting.command('connect-and-vote').action(async () => await voteLastVoting());

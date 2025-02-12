import { Address } from 'viem';
import { program } from 'command';
import {
  // getTokenManagerContract,
  getVaultHubContract,
  getVotingContract,
} from 'contracts';
import { getAccount } from 'providers';
import { getChain } from 'configs';
import { voteLastVoting } from 'features';

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
      try {
        const contract = await getVaultHubContract();
        // const tmContract = getTokenManagerContract();
        // const vContract = getVotingContract();
        const account = getAccount();

        const tx = await contract.write.connectVault(
          [
            address,
            shareLimit,
            reserveRatio,
            reserveRatioThreshold,
            treasuryFeeBP,
          ],
          {
            account,
            chain: getChain(),
          },
        );

        console.table({ Transaction: tx });
      } catch (err) {
        if (err instanceof Error) {
          program.error(err.message);
        }
      }
    },
  );

voting.command('get-lv').action(async () => {
  const { contract } = getVotingContract();

  try {
    const tx = await contract.read.votesLength();

    console.info({ 'Votes length': tx });
  } catch (err) {
    if (err instanceof Error) {
      console.info('Error when getting votes length:\n', err.message);
    }
  }
});

voting.command('connect-and-vote').action(async () => await voteLastVoting());

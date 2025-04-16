import progress, { SingleBar } from 'cli-progress';

import { getVotingContract } from 'contracts';
import {
  sleep,
  callReadMethod,
  callWriteMethodWithReceipt,
  logInfo,
} from 'utils';
import { Vote } from 'types';

const voteAbi = [
  {
    name: 'open',
  },
  {
    name: 'executed',
  },
  {
    name: 'startDate',
  },
  {
    name: 'snapshotBlock',
  },
  {
    name: 'supportRequired',
  },
  {
    name: 'minAcceptQuorum',
  },
  {
    name: 'yea',
  },
  {
    name: 'nay',
  },
  {
    name: 'votingPower',
  },
  {
    name: 'script',
  },
  {
    name: 'phase',
  },
];

export const voteLastVoting = async () => {
  const { contract } = getVotingContract();
  const votesLength = await callReadMethod(contract, 'votesLength');
  const lastVoteId = votesLength - 1n;

  if (lastVoteId === -1n) {
    console.warn('No votes');
    return;
  }

  const lastVote = await contract.read.getVote([lastVoteId]);
  const voteMap = createVoteMap(lastVote);
  logInfo('voteLastVoting');
  logInfo('voteMap', voteMap);

  if (!voteMap.open) {
    console.warn('Vote is not open');
    return;
  }

  if (voteMap.phase !== 0n) {
    console.warn('Wrong phase');
    return;
  }

  await voteFor(lastVoteId);
  await waitForEnd(lastVoteId);
  await executeVote(lastVoteId);
};

export const voteFor = async (voteId: bigint) => {
  const { contract } = getVotingContract();

  await callWriteMethodWithReceipt(contract, 'vote', [voteId, true, false]);
  logInfo('Vote voted', voteId);
};

export const executeVote = async (voteId: bigint) => {
  const { contract } = getVotingContract();
  await callWriteMethodWithReceipt(contract, 'executeVote', [voteId]);
  logInfo('Vote executed', voteId);
};

export const waitForEnd = async (voteId: bigint, progressBar?: SingleBar) => {
  const { contract, client } = getVotingContract();
  const [vote, voteTime, block] = await Promise.all([
    contract.read.getVote([voteId]),
    contract.read.voteTime(),
    client.getBlock(),
  ]);

  if (!block) throw new Error('Can not get latest block');

  const voteMap = createVoteMap(vote);
  const voteStart = Number(voteMap.startDate);
  const voteEnd = voteStart + Number(voteTime);
  const bTimestamp = Number(block.timestamp);
  const secondsLeft = Math.max(0, voteEnd - bTimestamp);
  const currentPosition = Math.min(bTimestamp - voteStart, Number(voteTime));

  if (!voteMap.open) {
    progressBar?.update(currentPosition, { secondsLeft });
    progressBar?.stop();

    return;
  }

  if (progressBar) {
    progressBar.update(currentPosition, { secondsLeft });
  } else {
    progressBar = new progress.SingleBar(
      {
        format: `Vote #${voteId} in progress |{bar}| {percentage}% | {secondsLeft}s left`,
      },
      progress.Presets.shades_classic,
    );

    progressBar.start(Number(voteTime), currentPosition, { secondsLeft });
  }

  await sleep(10_000);
  await waitForEnd(voteId, progressBar);
};

export const createVoteMap = (vote: Vote) => {
  return vote.reduce(
    (acc, item, index) => {
      if (voteAbi[index]) {
        acc[voteAbi[index].name] = item;
      }

      return acc;
    },
    {} as Record<string, any>,
  );
};

// export const checkTmCanForward = async () => {
//   const vContract = getVotingContract();
//   const signerAddress = await getSignerAddress(tmContract);
//   const canForward = await tmContract.canForward(signerAddress, '0x');
//
//   if (!canForward) {
//     console.warn('TM can not forward, check your LDO balance');
//     return false;
//   }
//
//   return true;
// };

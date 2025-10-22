import { formatEther, parseEther } from 'viem';

import { confirmOperation, textPrompt } from 'utils';

export const confirmSettledGrowth = async (currentSettledGrowth: bigint) => {
  const confirmCurrentSettledGrowth = await confirmOperation(
    `Are you sure there is no unaccounted for growth accrued on the vault while it was disconnected? Current settled growth is ${formatEther(currentSettledGrowth)}.`,
  );
  if (!confirmCurrentSettledGrowth) return;

  const answer = await textPrompt(
    'Enter the settled growth in ETH',
    'settledGrowth',
  );
  currentSettledGrowth = parseEther(answer.settledGrowth as string);
  if (!currentSettledGrowth) return;

  const confirmNewSettledGrowth = await confirmOperation(
    `Are you sure you want to use the settled growth of ${formatEther(currentSettledGrowth)}?`,
  );

  if (!confirmNewSettledGrowth) return;

  return currentSettledGrowth;
};

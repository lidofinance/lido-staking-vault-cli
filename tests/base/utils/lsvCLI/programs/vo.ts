import { runCLICommand } from '../helpers';
import { Address } from 'viem';

export const changeTierAsVM = (
  vaultAddress: Address,
  requestedShareLimit: string,
  tierId: number,
  privateKey: string,
): Promise<void> =>
  runCLICommand(
    [
      'vo',
      'w',
      'change-tier',
      '-v',
      vaultAddress,
      '-r',
      String(requestedShareLimit),
      String(tierId),
      '--yes',
    ],
    privateKey,
  );

export const changeTierByNO = (
  vaultAddress: Address,
  requestedShareLimit: string,
  tierId: number,
  privateKey: string,
): Promise<void> =>
  runCLICommand(
    [
      'vo',
      'w',
      'change-tier-by-no',
      '-v',
      vaultAddress,
      '-r',
      String(requestedShareLimit),
      String(tierId),
      '--yes',
    ],
    privateKey,
  );

export const fund = (
  vaultAddress: Address,
  amount: string,
  privateKey: string,
): Promise<void> =>
  runCLICommand(
    ['vo', 'w', 'fund', '-v', vaultAddress, amount, '--yes'],
    privateKey,
  );

export const mintStEth = (
  vaultAddress: Address,
  amount: string,
  recipient: Address,
  privateKey: string,
): Promise<void> =>
  runCLICommand(
    [
      'vo',
      'w',
      'mint-steth',
      '-v',
      vaultAddress,
      '-r',
      recipient,
      amount,
      '--yes',
    ],
    privateKey,
  );

export const burnStEth = (
  vaultAddress: Address,
  amount: string,
  privateKey: string,
): Promise<void> =>
  runCLICommand(
    ['vo', 'w', 'burn-steth', '-v', vaultAddress, amount, '--yes'],
    privateKey,
  );

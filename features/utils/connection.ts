import { Address } from 'viem';

import { getVaultHubContract } from 'contracts';
import { callReadMethodSilent, logInfo } from 'utils';

export const checkIsDisconnected = async (vault: Address) => {
  const vaultHubContract = await getVaultHubContract();
  const connection = await callReadMethodSilent({
    contract: vaultHubContract,
    methodName: 'vaultConnection',
    payload: [[vault]],
  });

  const isDisconnected =
    connection.owner === '0x0000000000000000000000000000000000000000' ||
    connection.vaultIndex === 0n;

  if (isDisconnected) {
    logInfo('⚠️  The vault is not connected to VaultHub  ⚠️');
    return true;
  }

  return false;
};

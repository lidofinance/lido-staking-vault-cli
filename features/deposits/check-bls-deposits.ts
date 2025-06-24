import { callReadMethod, isValidBLSDeposit } from 'utils';
import { PredepositGuaranteeContract, StakingVaultContract } from 'contracts';
import { Deposit } from 'types';

export const checkBLSDeposits = async (
  pdgContract: PredepositGuaranteeContract,
  vaultContract: StakingVaultContract,
  deposits: Deposit[],
) => {
  const PREDEPOSIT_AMOUNT = await callReadMethod(
    pdgContract,
    'PREDEPOSIT_AMOUNT',
  );
  const withdrawalCredentials = await callReadMethod(
    vaultContract,
    'withdrawalCredentials',
  );

  for (const deposit of deposits) {
    const isBLSValid = isValidBLSDeposit(deposit, withdrawalCredentials);

    if (deposit.amount !== PREDEPOSIT_AMOUNT) {
      throw new Error(
        `❌ Deposit amount is not equal to PREDEPOSIT_AMOUNT for pubkey ${deposit.pubkey}`,
      );
    }
    if (!isBLSValid) {
      throw new Error(
        `❌ Offchain - BLS signature is not valid for Pubkey ${deposit.pubkey}`,
      );
    }
  }
};

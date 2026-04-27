import { GetContractReturnType, Abi, PublicClient } from 'viem';
import { textPrompt } from './default.js';

import { resolveRole } from 'features/defi-wrapper/timelock-roles.js';

export const promptRole = async (
  roleInput: string | undefined,
  // hard to match correct type here
  contract: unknown,
) => {
  if (!roleInput) {
    const rolePrompt = await textPrompt(
      'Enter role (bytes32 hex or role name like DEFAULT_ADMIN_ROLE)',
      'role',
    );
    roleInput = rolePrompt.role as string;
  }

  const role = await resolveRole(
    roleInput,
    contract as GetContractReturnType<Abi, PublicClient>,
  );
  return role;
};

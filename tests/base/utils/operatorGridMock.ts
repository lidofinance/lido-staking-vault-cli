import { test } from '@playwright/test';
import { Address, getContract, parseEther } from 'viem';

import { OperatorGridAbi } from '../../../abi';
import { getStandConfig } from '../config';
import { PROTOCOL_CONFIG_ROLES_KECCAK } from '../testData/roles.data';
import { TierParams } from '../testData/consts';
import { getTestClient } from '../providers';

const operatorGridAddress = getStandConfig().contracts.operatorGrid;

export class OperatorGridMock {
  client: any;
  operatorGridContract: any;

  registryRoleAccount: Address = '0xad79579eEceF31f4719426232D7b527B17b84f85';

  static isRegistryRoleAccountSet = false;

  constructor() {
    this.client = getTestClient();
    this.operatorGridContract = getContract({
      address: operatorGridAddress,
      abi: OperatorGridAbi,
      client: this.client,
    });
  }

  async getRegistryRoleAddress() {
    if (!OperatorGridMock.isRegistryRoleAccountSet) {
      await this.setRegistryRoleAccount();
      OperatorGridMock.isRegistryRoleAccountSet = true;
    }
    return this.registryRoleAccount;
  }

  async setRegistryRoleAccount() {
    const defaultAdminRole = PROTOCOL_CONFIG_ROLES_KECCAK.DEFAULT_ADMIN_ROLE;

    // getRoleMemberCount(bytes32)
    const adminCount = await this.operatorGridContract.read.getRoleMemberCount([
      defaultAdminRole,
    ]);

    if (adminCount === 0n) {
      throw new Error('No DEFAULT_ADMIN_ROLE holders found');
    }

    const admin = await this.operatorGridContract.read.getRoleMember([
      defaultAdminRole,
      0n,
    ]);

    await this.client.setBalance({
      address: admin,
      value: parseEther('10'),
    });

    await this.client.impersonateAccount({ address: admin });

    const hash = await this.operatorGridContract.write.grantRole(
      [PROTOCOL_CONFIG_ROLES_KECCAK.REGISTRY_ROLE, this.registryRoleAccount],
      {
        account: admin,
      },
    );

    await this.client.waitForTransactionReceipt({ hash });

    await this.client.stopImpersonatingAccount({ address: admin });
  }

  async registerGroup(nodeOperator: string, shareLimit: bigint) {
    await test.step(`Register group for ${nodeOperator} with shareLimit=${shareLimit}`, async () => {
      const registry = await this.getRegistryRoleAddress();

      await this.client.impersonateAccount({ address: registry });

      const hash = await this.operatorGridContract.write.registerGroup(
        [nodeOperator, shareLimit],
        { account: registry },
      );

      await this.client.waitForTransactionReceipt({ hash });

      await this.client.stopImpersonatingAccount({ address: registry });
    });
  }

  async registerTier(nodeOperator: string, tiers: TierParams[]) {
    await test.step(`Register tier for ${nodeOperator}`, async () => {
      const registry = await this.getRegistryRoleAddress();

      await this.client.impersonateAccount({ address: registry });

      const hash = await this.operatorGridContract.write.registerTiers(
        [nodeOperator, tiers],
        { account: registry },
      );

      await this.client.waitForTransactionReceipt({ hash });

      await this.client.stopImpersonatingAccount({ address: registry });
    });
  }
}

import {
  Account,
  EthereumNodeService,
} from '@lidofinance/wallets-testing-nodes';

export const ROLES = {
  DEFAULT_ADMIN: 'DEFAULT_ADMIN_ROLE',
  NODE_OPERATOR: 'NODE_OPERATOR_ROLE',
  NODE_OPERATOR_MANAGER: 'NODE_OPERATOR_MANAGER_ROLE',
  BURN: 'BURN_ROLE',
  FUND: 'FUND_ROLE',
  MINT: 'MINT_ROLE',
  WITHDRAW: 'WITHDRAW_ROLE',
  PAUSE_BEACON_CHAIN_DEPOSITS: 'PAUSE_BEACON_CHAIN_DEPOSITS_ROLE',
  RESUME_BEACON_CHAIN_DEPOSITS: 'RESUME_BEACON_CHAIN_DEPOSITS_ROLE',
  REBALANCE: 'REBALANCE_ROLE',
  REQUEST_VALIDATOR_EXIT: 'REQUEST_VALIDATOR_EXIT_ROLE',
  TRIGGER_VALIDATOR_WITHDRAWAL: 'TRIGGER_VALIDATOR_WITHDRAWAL_ROLE',
  VOLUNTARY_DISCONNECT: 'VOLUNTARY_DISCONNECT_ROLE',
  VAULT_CONFIGURATION: 'VAULT_CONFIGURATION_ROLE',
  COLLECT_VAULT_ERC20: 'COLLECT_VAULT_ERC20_ROLE',
  NODE_OPERATOR_FEE_EXEMPT: 'NODE_OPERATOR_FEE_EXEMPT_ROLE',
  NODE_OPERATOR_PROVE_UNKNOWN_VALIDATOR:
    'NODE_OPERATOR_PROVE_UNKNOWN_VALIDATOR_ROLE',
  NODE_OPERATOR_UNGUARANTEED_DEPOSIT: 'NODE_OPERATOR_UNGUARANTEED_DEPOSIT_ROLE',

  STRANGER: 'STRANGER',
  VAULT_OWNER_AND_NoMANAGER: 'VAULT_OWNER_AND_NOMANAGER',
} as const;

export type RoleValue = (typeof ROLES)[keyof typeof ROLES];

type RoleData = { index: number; keccak: `0x${string}` };

export const DEFAULT_ROLES: readonly RoleValue[] = [
  ROLES.DEFAULT_ADMIN,
  ROLES.NODE_OPERATOR,
  ROLES.NODE_OPERATOR_MANAGER,
];

export const NO_ROLES: readonly RoleValue[] = [
  ROLES.NODE_OPERATOR_FEE_EXEMPT,
  ROLES.NODE_OPERATOR_PROVE_UNKNOWN_VALIDATOR,
  ROLES.NODE_OPERATOR_UNGUARANTEED_DEPOSIT,
];

export const EXTENDED_ROLES: readonly RoleValue[] = [ROLES.STRANGER];

export const getPermissionRole = (
  role: (typeof ROLES)[keyof typeof ROLES],
): RoleData => {
  const perm = PERMISSION_ROLES.get(role);
  if (!perm) {
    throw new Error(`Permission role not found: ${role}`);
  }
  return perm;
};

export const PERMISSION_ROLES = new Map<RoleValue, RoleData>([
  [
    ROLES.DEFAULT_ADMIN,
    {
      index: 0,
      keccak:
        '0x0000000000000000000000000000000000000000000000000000000000000000',
    },
  ],
  [
    ROLES.NODE_OPERATOR,
    {
      index: 1,
      keccak:
        '0xa8c345a04d2a8ac0607aad39bfdb2ca6e358d1265f2d2b16d62e9a5c37230c7d',
    },
  ],
  [
    ROLES.NODE_OPERATOR_MANAGER,
    {
      index: 2,
      keccak:
        '0x59783a4ae82167eefad593739a5430c1d9e896a16c35f1e5285ddd0c0980885c',
    },
  ],
  [
    ROLES.BURN,
    {
      index: 3,
      keccak:
        '0x689f0a569be0c9b6cd2c11c81cb0add722272abdae6b649fdb1e05f1d9bb8a2f',
    },
  ],
  [
    ROLES.FUND,
    {
      index: 4,
      keccak:
        '0x933b7d5c112a4d05b489cea0b2ced98acb27d3d0fc9827c92cdacb2d6c5559c2',
    },
  ],
  [
    ROLES.MINT,
    {
      index: 5,
      keccak:
        '0xe996ac9b332538bb1fa3cd6743aa47011623cdb94bd964a494ee9d371e4a27d3',
    },
  ],
  [
    ROLES.WITHDRAW,
    {
      index: 6,
      keccak:
        '0x355caf1c2580ed8185acb5ea3573b71f85186b41bdf69e3eb8f1fcd122a562df',
    },
  ],
  [
    ROLES.PAUSE_BEACON_CHAIN_DEPOSITS,
    {
      index: 7,
      keccak:
        '0xa90c7030a27f389f9fc8ed21a0556f40c88130cc14a80db936bed68261819b2c',
    },
  ],
  [
    ROLES.RESUME_BEACON_CHAIN_DEPOSITS,
    {
      index: 8,
      keccak:
        '0x59d005e32db662b94335d6bedfeb453fd2202b9f0cc7a6ed498d9098171744b0',
    },
  ],
  [
    ROLES.REBALANCE,
    {
      index: 9,
      keccak:
        '0x3f82ecf462ddac43fc17ba11472c35f18b7760b4f5a5fc50b9625f9b5a22cf62',
    },
  ],
  [
    ROLES.REQUEST_VALIDATOR_EXIT,
    {
      index: 10,
      keccak:
        '0x32d0d6546e21c13ff633616141dc9daad87d248d1d37c56bf493d06d627ecb7b',
    },
  ],
  [
    ROLES.TRIGGER_VALIDATOR_WITHDRAWAL,
    {
      index: 11,
      keccak:
        '0xea19d3b23bd90fdd52445ad672f2b6fb1fef7230d49c6a827c1cd288d02994d5',
    },
  ],
  [
    ROLES.VOLUNTARY_DISCONNECT,
    {
      index: 12,
      keccak:
        '0x9586321ac05f110e4b4a0a42aba899709345af0ca78910e8832ddfd71fed2bf4',
    },
  ],
  [
    ROLES.VAULT_CONFIGURATION,
    {
      index: 13,
      keccak:
        '0x25482e7dc9e29f6da5bd70b6d19d17bbf44021da51ba0664a9f430c94a09c674',
    },
  ],
  [
    ROLES.COLLECT_VAULT_ERC20,
    {
      index: 14,
      keccak:
        '0xb694d4d19c77484e8f232470d9bf7e10450638db998b577a833d46df71fb6d97',
    },
  ],
  [
    ROLES.NODE_OPERATOR_FEE_EXEMPT,
    {
      index: 15,
      keccak:
        '0xcceeef0309e9a678ed7f11f20499aeb00a9a4b0d50e53daa428f8591debc583a',
    },
  ],
  [
    ROLES.NODE_OPERATOR_PROVE_UNKNOWN_VALIDATOR,
    {
      index: 16,
      keccak:
        '0x7b564705f4e61596c4a9469b6884980f89e475befabdb849d69719f0791628be',
    },
  ],
  [
    ROLES.NODE_OPERATOR_UNGUARANTEED_DEPOSIT,
    {
      index: 17,
      keccak:
        '0x5c17b14b08ace6dda14c9642528ae92de2a73d59eacb65c71f39f309a5611063',
    },
  ],
  [
    ROLES.VAULT_OWNER_AND_NoMANAGER,
    {
      index: 18,
      keccak:
        '0x0000000000000000000000000000000000000000000000000000000000000000',
    },
  ],
  [ROLES.STRANGER, { index: 19, keccak: '0x' }],
]);

export const buildAdditionalRoles = (ethereumNodeService: {
  getAccount(index: number): { address: string };
}) => {
  const EXCLUDED_ROLES = [...DEFAULT_ROLES, ...EXTENDED_ROLES, ...NO_ROLES];

  return Array.from(PERMISSION_ROLES.entries())
    .filter(([role]) => !EXCLUDED_ROLES.includes(role))
    .map(([, { index, keccak }]) => ({
      account: ethereumNodeService.getAccount(index).address,
      role: keccak,
    }));
};

export type DefaultVaultData = {
  vaultAddress: string;
  dashboardAddress: string;
  roles: {
    defaultAdmin: Account;
    nodeOperator: Account;
    nodeOperatorManager: Account;
    burn: Account;
    fund: Account;
    mint: Account;
    withdraw: Account;
    pauseBeaconChainDeposits: Account;
    resumeBeaconChainDeposits: Account;
    rebalance: Account;
    requestValidatorExit: Account;
    triggerValidatorWithdrawal: Account;
    voluntaryDisconnect: Account;
    vaultConfiguration: Account;
    collectVaultErc20: Account;
    noFeeExempt: Account;
    noProveUnknowValidator: Account;
    noUnguranteedeposit: Account;
    stranger: Account;
    vaultOwnerAndNoManager: Account;
  };
};

export const getDefaultVaultData = (
  ethereumNodeService: EthereumNodeService,
): DefaultVaultData => {
  const acc = (role: (typeof ROLES)[keyof typeof ROLES]) => {
    const permission = PERMISSION_ROLES.get(role);
    if (!permission) {
      throw new Error(`Role ${role} not found in PERMISSION_ROLES`);
    }
    return ethereumNodeService.getAccount(permission.index);
  };

  return {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    vaultAddress: process.env.VAULT_ADDRESS!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    dashboardAddress: process.env.DASHBOARD_ADDRESS!,
    roles: {
      defaultAdmin: acc(ROLES.DEFAULT_ADMIN),
      nodeOperator: acc(ROLES.NODE_OPERATOR),
      nodeOperatorManager: acc(ROLES.NODE_OPERATOR_MANAGER),
      burn: acc(ROLES.BURN),
      fund: acc(ROLES.FUND),
      mint: acc(ROLES.MINT),
      withdraw: acc(ROLES.WITHDRAW),
      pauseBeaconChainDeposits: acc(ROLES.PAUSE_BEACON_CHAIN_DEPOSITS),
      resumeBeaconChainDeposits: acc(ROLES.RESUME_BEACON_CHAIN_DEPOSITS),
      rebalance: acc(ROLES.REBALANCE),
      requestValidatorExit: acc(ROLES.REQUEST_VALIDATOR_EXIT),
      triggerValidatorWithdrawal: acc(ROLES.TRIGGER_VALIDATOR_WITHDRAWAL),
      voluntaryDisconnect: acc(ROLES.VOLUNTARY_DISCONNECT),
      vaultConfiguration: acc(ROLES.VAULT_CONFIGURATION),
      collectVaultErc20: acc(ROLES.COLLECT_VAULT_ERC20),
      noFeeExempt: acc(ROLES.NODE_OPERATOR_FEE_EXEMPT),
      noProveUnknowValidator: acc(ROLES.NODE_OPERATOR_PROVE_UNKNOWN_VALIDATOR),
      noUnguranteedeposit: acc(ROLES.NODE_OPERATOR_UNGUARANTEED_DEPOSIT),
      vaultOwnerAndNoManager: acc(ROLES.VAULT_OWNER_AND_NoMANAGER),
      stranger: acc(ROLES.STRANGER),
    },
  };
};

// import { test } from './test.fixture';
// import { getStandConfig } from '../config/env.config';
// import {
//   buildAdditionalRoles,
//   getPermissionRole,
//   NO_ROLES,
//   PERMISSION_ROLES,
//   ROLES,
// } from '../testData/roles.data';
// import lsvCLI from '../utils/lsvCLI';
//
// // For globalSetup we need to save fork state for continue tests state
// test.use({
//   nodeRunOptions: ['--dump-state=./state.json', '--state-interval=1'],
// });
//
// const CONFIRM_EXPIRY = 86400;
// const NO_FEE_RATE = 100;
//
// test('Create defaultVault', async ({
//   ethereumNodeService,
//   defaultVaultData,
// }) => {
//   await test.step('Setup env for CLI', async () => {
//     if (ethereumNodeService.state) {
//       process.env.DEPLOYED = `../../../configs/${getStandConfig().deployed}`;
//       process.env.EL_URL = ethereumNodeService.state.nodeUrl;
//     } else throw new Error('EthereumNodeService node ready');
//   });
//
//   const { roles } = defaultVaultData;
//
//   const vaultData = await test.step('Create vault && configure', async () => {
//     const additionalRoles = buildAdditionalRoles(ethereumNodeService);
//     const vaultCreatorPK = ethereumNodeService.getAccount(
//       getPermissionRole(ROLES.DEFAULT_ADMIN).index,
//     ).secretKey;
//
//     return await lsvCLI.factory.createVaultConnectedToVh({
//       defaultAdmin: roles.defaultAdmin.address,
//       nodeOperator: roles.nodeOperator.address,
//       nodeOperatorManager: roles.nodeOperatorManager.address,
//       confirmExpiry: CONFIRM_EXPIRY,
//       nodeOperatorFeeRate: NO_FEE_RATE,
//       roles: additionalRoles,
//       privateKey: vaultCreatorPK,
//     });
//   });
//
//   await test.step('Grant additional NO related roles', async () => {
//     const nomRolePK = ethereumNodeService.getAccount(
//       getPermissionRole(ROLES.NODE_OPERATOR_MANAGER).index,
//     ).secretKey;
//
//     await lsvCLI.dashboard.grantRole(
//       vaultData.dashboardAddress,
//       Array.from(PERMISSION_ROLES.entries())
//         .filter(([role]) => NO_ROLES.includes(role))
//         .map(([, { index, keccak }]) => ({
//           account: ethereumNodeService.getAccount(index).address,
//           role: keccak,
//         })),
//       nomRolePK,
//     );
//
//     // pass default vault address to pw tests process
//     process.env.VAULT_ADDRESS = vaultData.vaultAddress;
//     process.env.DASHBOARD_ADDRESS = vaultData.dashboardAddress;
//   });
// });

import { test } from './test.fixture';
import { formatEther, Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { getStandConfig } from '../config';
import {
  createVote,
  executeVote,
  getLdoTokenBalance,
  getProposalsCount,
  getVote,
  getVotesTotalAmount,
  processProposals,
  vote,
} from '../tempDelete/contracts';
import { ldoTokenAbi } from '../tempDelete/abi';
import { expect } from '@playwright/test';
import { jumpForward } from '../providers';
import { DAY_SEC } from '../tempDelete/voteCreationData';

const QUORUM_THRESHOLD = 60000001;
const daysBeforeVoteCanBeEnacted = 5;

test('Setup: create vote and process DG proposals', async ({
  ethereumNodeService,
}) => {
  const account = privateKeyToAccount(
    ethereumNodeService.getAccount(0).secretKey as Hex,
  );

  await test.step('Set LDO balance for quorum vote', async () => {
    await ethereumNodeService.setErc20BalanceImpersonate(
      ldoTokenAbi,
      getStandConfig().contracts.ldoContract,
      ethereumNodeService.getAccount(0),
      QUORUM_THRESHOLD,
    );

    const ldoTokenBalance = await getLdoTokenBalance(account.address);
    expect(formatEther(ldoTokenBalance)).toBe(String(QUORUM_THRESHOLD));
  });

  const voteId = await test.step('Create vote', async () => {
    const voteData = getStandConfig().voteCreationData;
    const voteCountBefore = Number(await getVotesTotalAmount());

    await createVote(account, voteData);

    const voteCountAfter = Number(await getVotesTotalAmount());
    expect(voteCountAfter).toBe(voteCountBefore + 1);

    return voteCountAfter;
  });

  const voteNumber = voteId - 1;

  await test.step('Pass vote, enact and process DG', async () => {
    await vote(account, voteNumber, true, true);

    await jumpForward(daysBeforeVoteCanBeEnacted * DAY_SEC);

    const proposalsCountBefore = await getProposalsCount();
    await executeVote(account, voteNumber);

    const { open: isVoteOpen, executed: isVoteExecuted } =
      await getVote(voteNumber);
    expect(isVoteOpen).toBe(false);
    expect(isVoteExecuted).toBe(true);

    const proposalsCountAfter = await getProposalsCount();
    if (proposalsCountAfter > proposalsCountBefore) {
      const newProposalIds: bigint[] = [];
      for (let i = proposalsCountBefore + 1n; i <= proposalsCountAfter; i++) {
        newProposalIds.push(i);
      }
      await processProposals(account, newProposalIds);
    }
  });
});

// // // // import { test } from './test.fixture';
// // // // import { getStandConfig } from '../config/env.config';
// // // // import {
// // // //   buildAdditionalRoles,
// // // //   getPermissionRole,
// // // //   NO_ROLES,
// // // //   PERMISSION_ROLES,
// // // //   ROLES,
// // // // } from '../testData/roles.data';
// // // // import lsvCLI from '../utils/lsvCLI';
// // // //
// // // // // For globalSetup we need to save fork state for continue tests state
// // // // test.use({
// // // //   nodeRunOptions: ['--dump-state=./state.json', '--state-interval=1'],
// // // // });
// // // //
// // // // const CONFIRM_EXPIRY = 86400;
// // // // const NO_FEE_RATE = 100;
// // // //
// // // // test('Create defaultVault', async ({
// // // //   ethereumNodeService,
// // // //   defaultVaultData,
// // // // }) => {
// // // //   await test.step('Setup env for CLI', async () => {
// // // //     if (ethereumNodeService.state) {
// // // //       process.env.DEPLOYED = `../../../configs/${getStandConfig().deployed}`;
// // // //       process.env.EL_URL = ethereumNodeService.state.nodeUrl;
// // // //     } else throw new Error('EthereumNodeService node ready');
// // // //   });
// // // //
// // // //   const { roles } = defaultVaultData;
// // // //
// // // //   const vaultData = await test.step('Create vault && configure', async () => {
// // // //     const additionalRoles = buildAdditionalRoles(ethereumNodeService);
// // // //     const vaultCreatorPK = ethereumNodeService.getAccount(
// // // //       getPermissionRole(ROLES.DEFAULT_ADMIN).index,
// // // //     ).secretKey;
// // // //
// // // //     return await lsvCLI.factory.createVaultConnectedToVh({
// // // //       defaultAdmin: roles.defaultAdmin.address,
// // // //       nodeOperator: roles.nodeOperator.address,
// // // //       nodeOperatorManager: roles.nodeOperatorManager.address,
// // // //       confirmExpiry: CONFIRM_EXPIRY,
// // // //       nodeOperatorFeeRate: NO_FEE_RATE,
// // // //       roles: additionalRoles,
// // // //       privateKey: vaultCreatorPK,
// // // //     });
// // // //   });
// // // //
// // // //   await test.step('Grant additional NO related roles', async () => {
// // // //     const nomRolePK = ethereumNodeService.getAccount(
// // // //       getPermissionRole(ROLES.NODE_OPERATOR_MANAGER).index,
// // // //     ).secretKey;
// // // //
// // // //     await lsvCLI.dashboard.grantRole(
// // // //       vaultData.dashboardAddress,
// // // //       Array.from(PERMISSION_ROLES.entries())
// // // //         .filter(([role]) => NO_ROLES.includes(role))
// // // //         .map(([, { index, keccak }]) => ({
// // // //           account: ethereumNodeService.getAccount(index).address,
// // // //           role: keccak,
// // // //         })),
// // // //       nomRolePK,
// // // //     );
// // // //
// // // //     // pass default vault address to pw tests process
// // // //     process.env.VAULT_ADDRESS = vaultData.vaultAddress;
// // // //     process.env.DASHBOARD_ADDRESS = vaultData.dashboardAddress;
// // // //   });
// // // // });
// // //
// import { test } from './test.fixture';
// import { Hex, Address } from 'viem';
// import { privateKeyToAccount } from 'viem/accounts';
// import { getStandConfig } from '../config';
// import {
//   getProposalsCount,
//   processProposals,
//   checkLidoLocatorImplementation,
// } from '../tempDelete/contracts';
// import process from 'node:process';
//
// test.use({
//   nodeRunOptions: ['--dump-state=./state.json'],
// });
//
// test('Setup: submit DG proposals starting from id=6', async ({
//   ethereumNodeService,
// }) => {
//   const account = privateKeyToAccount(
//     ethereumNodeService.getAccount(0).secretKey as Hex,
//   );
//
//   await test.step('Setup env for CLI', async () => {
//     const standConfig = getStandConfig();
//     if (ethereumNodeService.state) {
//       process.env.DEPLOYED = `../../../configs/${standConfig.deployed}`;
//       process.env.EL_URL = ethereumNodeService.state.nodeUrl;
//       process.env.CHAIN_ID = standConfig.networkConfig.chainId.toString();
//     } else throw new Error('EthereumNodeService node ready');
//   });
//
//   await test.step('SubmitDG from proposal id=6', async () => {
//     const proposalsCount = await getProposalsCount();
//     const targetProposalId = 6n;
//
//     if (proposalsCount >= targetProposalId) {
//       const proposalIds: bigint[] = [targetProposalId];
//       await processProposals(account, proposalIds);
//     }
//   });
//
//   await test.step('Check proposal submitted', async () => {
//     // Check that LidoLocator implementation has been updated
//     const expectedLidoLocatorImplementation =
//       '0x2f8779042EFaEd4c53db2Ce293eB6B3f7096C72d' as Address;
//     await checkLidoLocatorImplementation(expectedLidoLocatorImplementation);
//   });
// });
export {};

import { program } from 'command';
import { createVault } from 'features';
import { CreateVaultPayload, VaultWithDelegation } from 'types';
import {
  validateAddressesMap,
  validateAddressMap,
  transformAddressesToArray,
} from 'utils';

import { vaultFactory } from './main.js';

vaultFactory
  .command('create-vault')
  .description('create vault contract')
  .option('-f, --funders <funders>', 'funders role address')
  .option('-w, --withdrawers <withdrawers>', 'withdrawers role address')
  .option('-m, --minters <minters>', 'minters role address')
  .option('-b, --burners <burners>', 'burners role address')
  .option('-r, --rebalancers <rebalancers>', 'rebalancers role address')
  .option(
    '-p, --depositPausers <depositPausers>',
    'depositPausers role address',
  )
  .option(
    '-d, --depositResumers <depositResumers>',
    'depositResumers role address',
  )
  .option(
    '-e, --exitRequesters <exitRequesters>',
    'exitRequesters role address',
  )
  .option('-u, --disconnecters <disconnecters>', 'disconnecters role address')
  .option('-c, --curators <curators>', 'curators role address')
  .option(
    '-ve, --validatorExitRequesters <validatorExitRequesters>',
    'validator exit requesters role addresses',
  )
  .option(
    '-vt, --validatorWithdrawalTriggerers <validatorWithdrawalTriggerers>',
    'validator withdrawal triggerers role address',
  )
  .option(
    '-o, --nodeOperatorFeeClaimer <nodeOperatorFeeClaimer>',
    'node operator fee claimer address',
  )
  .option(
    '-cfs, --curatorFeeSetters <curatorFeeSetters>',
    'curator fee setters role addresses',
  )
  .option(
    '-cfc, --curatorFeeClaimers <curatorFeeClaimers>',
    'curator fee claimers role addresses',
  )
  .option(
    '-nofc, --nodeOperatorFeeClaimers <nodeOperatorFeeClaimers>',
    'node operator fee claimers role addresses',
  )
  .argument('<defaultAdmin>', 'default admin address')
  .argument('<nodeOperatorManager>', 'node operator manager address')
  .argument('<assetRecoverer>', 'asset recoverer address')
  .argument('<confirmExpiry>', 'confirm expiry')
  .argument('<curatorFeeBP>', 'Vault curator fee, for e.g. 100 == 1%')
  .argument('<nodeOperatorFeeBP>', 'Node operator fee, for e.g. 100 == 1%')
  .argument('[quantity]', 'quantity of vaults to create, default 1', '1')
  .action(
    async (
      defaultAdmin: string,
      nodeOperatorManager: string,
      assetRecoverer: string,
      confirmExpiry: string,
      curatorFeeBP: string,
      nodeOperatorFeeBP: string,
      quantity: string,
      options: CreateVaultPayload,
    ) => {
      const curatorFee = parseInt(curatorFeeBP);
      const nodeOperatorFee = parseInt(nodeOperatorFeeBP);
      const confirmExpiryNumber = Number(confirmExpiry);
      const qnt = parseInt(quantity);

      if (isNaN(curatorFee) || curatorFee < 0) {
        program.error('curator fee must be a positive number', { exitCode: 1 });
      }

      if (isNaN(nodeOperatorFee) || nodeOperatorFee < 0) {
        program.error('operator fee must be a positive number', {
          exitCode: 1,
        });
      }

      if (isNaN(confirmExpiryNumber) || confirmExpiryNumber < 0) {
        program.error('confirm expiry must be a positive number', {
          exitCode: 1,
        });
      }

      if (isNaN(qnt)) {
        program.error('quantity must be a number', { exitCode: 1 });
      }

      const extraKeys: (keyof CreateVaultPayload)[] = [
        'funders',
        'withdrawers',
        'minters',
        'burners',
        'rebalancers',
        'depositPausers',
        'depositResumers',
        'validatorExitRequesters',
        'validatorWithdrawalTriggerers',
        'disconnecters',
        'curatorFeeSetters',
        'curatorFeeClaimers',
        'nodeOperatorFeeClaimers',
      ];

      const addresses = transformAddressesToArray(options, extraKeys);
      const errorsAddressesList = validateAddressesMap(addresses);
      const errorsList = [
        ...errorsAddressesList,
        ...validateAddressMap([
          assetRecoverer,
          defaultAdmin,
          nodeOperatorManager,
        ]),
      ];
      if (errorsList.length > 0) {
        errorsList.forEach((error) => program.error(error));
        return;
      }

      // eslint-disable-next-line unicorn/new-for-builtins
      const list: number[] = Array.from(Array(qnt));
      const payload = {
        ...options,
        ...addresses,
        defaultAdmin,
        nodeOperatorManager,
        assetRecoverer,
        confirmExpiry: BigInt(confirmExpiry),
        curatorFeeBP: curatorFee,
        nodeOperatorFeeBP: nodeOperatorFee,
      } as VaultWithDelegation;

      const transactions = [];

      try {
        for (const _ of list) {
          const tx = await createVault(payload);
          transactions.push(tx);
        }

        console.table(transactions);
      } catch (err) {
        if (err instanceof Error) {
          console.info('Error occurred while creating vaults', err.message);
        }
      }
    },
  );

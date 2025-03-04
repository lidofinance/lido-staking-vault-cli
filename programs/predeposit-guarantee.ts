import { program } from 'command';

import { createPDGProof, getFirstValidatorGIndex } from 'utils/index.js';

const predepositGuarantee = program
  .command('pdg')
  .description('predeposit guarantee contract');

predepositGuarantee
  .command('create-proof')
  .description('create predeposit proof by validator index')
  .argument('<validator-index>', 'validator index')
  .action(async (validatorIndex: bigint) => {
    const packageProof = await createPDGProof(Number(validatorIndex));
    const { proof, pubkey, childBlockTimestamp, withdrawalCredentials } =
      packageProof;

    console.info('-----------------proof verified-----------------');
    console.info('------------------------------------------------');
    console.info('----------------------proof----------------------');
    console.info(proof);
    console.info('---------------------pubkey---------------------');
    console.table(pubkey);
    console.info('---------------childBlockTimestamp---------------');
    console.table(childBlockTimestamp);
    console.info('--------------withdrawalCredentials--------------');
    console.table(withdrawalCredentials);
    console.info('------------------------------------------------');
    console.info('-----------------------end-----------------------');
  });

predepositGuarantee
  .command('fv-gindex')
  .argument('<forks...>', 'fork name')
  .description('get first validator gindex')
  .action(async (forks: string[]) => {
    getFirstValidatorGIndex(forks);
  });

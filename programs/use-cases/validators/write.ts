import {
  logInfo,
  retryCall,
  stringTo2dArray,
  stringToAddress,
  stringToArray,
} from 'utils';
import { validators } from './main.js';
import Safe from '@safe-global/protocol-kit';
import { getSafeTxHash } from '../../../features/consolidation.js';
import { Address } from 'viem';

const validatorsWrite = validators
  .command('write')
  .aliases(['w'])
  .description('validators write commands');

validatorsWrite
  .command('consolidate')
  .description('consolidate validators')
  .argument('<safe_address>', 'safe address', stringToAddress)
  .argument('<consolidation_address>', 'consolidation address', stringToAddress)
  .argument('<refund_recipient>', 'refund recipient address', stringToAddress)
  .argument(
    '<source_pubkeys>',
    'source pubkeys of the validators to consolidate from. Comma separated list of lists pubkeys',
    stringTo2dArray,
  )
  .argument(
    '<target_pubkeys>',
    'pubkeys of the validators to withdraw. Comma separated list of pubkeys',
    stringToArray,
  )
  .action(
    async (
      safeAddress: Address,
      consolidationAddress: Address,
      refundRecipient: Address,
      sourcePubkeys: string[][],
      targetPubkeys: string[],
    ) => {
      logInfo('create and approve consolidation hash');
      logInfo('safeAddress:', safeAddress);
      logInfo('consolidationAddress:', consolidationAddress);
      logInfo('refundRecipient:', refundRecipient);
      logInfo('sourcePubkeys:', sourcePubkeys);
      logInfo('targetPubkeys:', targetPubkeys);

      const provider = process.env.RPC_URL;
      if (!provider) {
        throw new Error('Missing RPC_URL environment variable');
      }

      const signer = process.env.OWNER_PRIVATE_KEY;
      if (!signer) {
        throw new Error('Missing OWNER_PRIVATE_KEY environment variable');
      }

      const safe = await retryCall(async () => {
        return await Safe.init({
          provider: provider,
          signer: signer,
          safeAddress: safeAddress,
        });
      });
      logInfo('Safe instance initialized');

      const safeTxHash = await getSafeTxHash(
        safe,
        sourcePubkeys,
        targetPubkeys,
        refundRecipient,
      );
      logInfo('Safe tx hash:');
      logInfo(safeTxHash);

      const signature = await retryCall(async () => {
        return await safe.signHash(safeTxHash);
      });

      logInfo('Signature:');
      logInfo(signature);

      logInfo('Proposing transaction to the service');

      await retryCall(async () => {
        await safe.approveTransactionHash(safeTxHash);
      });
    },
  );

import {
  logInfo,
  retryCall,
  stringToAddress,
  stringTo2dArray,
  stringToArray,
} from 'utils';
import { Address } from 'viem';
import { validators } from './main.js';
import { getSafeTxHash } from '../../../features/consolidation.js';
import Safe from '@safe-global/protocol-kit';

const validatorsRead = validators
  .command('read')
  .aliases(['r'])
  .description('validators read commands');

validatorsRead
  .command('consolidation_tx_hash')
  .description('get consolidation transaction hash')
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
      source_pubkeys: string[][],
      target_pubkeys: string[],
    ) => {
      logInfo('get consolidation hash');
      logInfo('safeAddress:', safeAddress);
      logInfo('consolidationAddress:', consolidationAddress);
      logInfo('refundRecipient:', refundRecipient);
      logInfo('source_pubkeys:', source_pubkeys);
      logInfo('target_pubkeys:', target_pubkeys);

      const provider = process.env.RPC_URL;
      if (!provider) {
        throw new Error('Missing RPC_URL environment variable');
      }

      const safe = await retryCall(async () => {
        return await Safe.init({
          provider: provider,
          safeAddress: safeAddress,
        });
      });

      const safeTxHash = await getSafeTxHash(
        safe,
        source_pubkeys,
        target_pubkeys,
        refundRecipient,
      );
      logInfo('Safe tx hash:', safeTxHash);
    },
  );

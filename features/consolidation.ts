import { retryCall } from 'utils';
import Safe from '@safe-global/protocol-kit';
import { MetaTransactionData, OperationType } from '@safe-global/types-kit';
import { config } from 'dotenv';
import { ethers } from 'ethers';
config();

export const getSafeTxHash = async (
  safe: Safe,
  sourcePubkeys: string[][],
  targetPubkeys: string[],
  refundRecipient: string,
) => {
  const calldata = consolidationRequestCalldata(
    sourcePubkeys,
    targetPubkeys,
    refundRecipient,
  );

  const consolidationContract = process.env.CONSOLIDATION_CONTRACT;
  if (!consolidationContract) {
    throw new Error('Missing CONSOLIDATION_CONTRACT environment variable');
  }

  const safeTransactionData: MetaTransactionData = {
    to: consolidationContract,
    value: '1',
    data: calldata,
    operation: OperationType.DelegateCall,
  };

  const safeTransaction = await retryCall(async () => {
    return await safe.createTransaction({
      transactions: [safeTransactionData],
    });
  });

  const safeTxHash = await retryCall(async () => {
    return await safe.getTransactionHash(safeTransaction);
  });

  return safeTxHash;
};

const consolidationRequestCalldata = (
  sourcePubkeys: string[][],
  targetPubkeys: string[],
  refundRecipient: string,
): string => {
  const abi = [
    {
      name: 'addConsolidationRequests',
      type: 'function',
      stateMutability: 'payable',
      inputs: [
        { name: '_sourcePubkeys', type: 'bytes[]' },
        { name: '_targetPubkeys', type: 'bytes[]' },
        { name: '_refundRecipient', type: 'address' },
      ],
      outputs: [],
    },
  ];

  const sourcePubkeysFormatted = flattenInnerHexGroups(sourcePubkeys);
  const iface = new ethers.Interface(abi);

  const calldata = iface.encodeFunctionData('addConsolidationRequests', [
    sourcePubkeysFormatted,
    targetPubkeys,
    refundRecipient,
  ]);
  return calldata;
};

const flattenInnerHexGroups = (nested: string[][]): string[] => {
  return nested.map(
    (group) => '0x' + group.map((p) => p.replace(/^0x/, '')).join(''),
  );
};

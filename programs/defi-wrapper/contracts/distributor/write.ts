import { Option } from 'commander';

import {
  logInfo,
  getCommandsJson,
  stringToAddress,
  callWriteMethodWithReceipt,
  etherToWei,
  stringToHexArray,
  confirmOperation,
} from 'utils';

import { distributor } from './main.js';
import { Address, formatEther, Hex, stringToHex } from 'viem';
import { getDistributorContract } from 'contracts/defi-wrapper/index.js';

const distributorWrite = distributor
  .command('write')
  .alias('w')
  .description('distributor write commands');

distributorWrite.addOption(new Option('-cmd2json'));
distributorWrite.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(distributorWrite));
  process.exit();
});

distributorWrite
  .command('add-token')
  .description('add a token to the list of supported tokens')
  .argument('<address>', 'distributor address', stringToAddress)
  .argument('<token>', 'token address', stringToAddress)
  .action(async (address: Address, token: Address) => {
    const contract = getDistributorContract(address);

    const confirmationMessage = `Are you sure you want to add the token ${token} to the list of supported tokens?`;
    const confirm = await confirmOperation(confirmationMessage);
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'addToken',
      payload: [token],
    });
  });

distributorWrite
  .command('set-merkle-root')
  .description('sets the Merkle root and CID')
  .argument('<address>', 'distributor address', stringToAddress)
  .argument('<root>', 'root', stringToHex)
  .argument('<cid>', 'cid', stringToHex)
  .action(async (address: Address, root: Hex, cid: Hex) => {
    const contract = getDistributorContract(address);

    const confirmationMessage = `Are you sure you want to set the Merkle root ${root} and CID ${cid}?`;
    const confirm = await confirmOperation(confirmationMessage);
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'setMerkleRoot',
      payload: [root, cid],
    });
  });

distributorWrite
  .command('claim')
  .description('claims rewards')
  .argument('<address>', 'distributor address', stringToAddress)
  .argument('<recipient>', 'recipient address', stringToAddress)
  .argument('<token>', 'token address', stringToAddress)
  .argument('<amount>', 'amount', etherToWei)
  .argument('<proof>', 'proof', stringToHexArray)
  .action(
    async (
      address: Address,
      recipient: Address,
      token: Address,
      amount: bigint,
      proof: Hex[],
    ) => {
      const contract = getDistributorContract(address);

      const confirmationMessage = `Are you sure you want to claim ${formatEther(amount)} ${token} for ${recipient}?`;
      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'claim',
        payload: [recipient, token, amount, proof],
      });
    },
  );

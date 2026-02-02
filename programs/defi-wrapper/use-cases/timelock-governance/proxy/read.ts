import { Option } from 'commander';
import {
  logInfo,
  getCommandsJson,
  stringToAddress,
  callReadMethodSilent,
  logResult,
  addressPrompt,
} from 'utils';
import { proxy } from './main.js';
import { Address } from 'viem';
import { getOssifiableProxyContract } from 'contracts/defi-wrapper/index.js';

const proxyRead = proxy
  .command('read')
  .alias('r')
  .description('proxy timelock read commands');

proxyRead.addOption(new Option('-cmd2json'));
proxyRead.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(proxyRead));
  process.exit();
});

proxyRead
  .command('get-admin')
  .description('get the admin of a proxy contract')
  .argument('[proxy]', 'proxy contract address', stringToAddress)
  .action(async (proxyAddress?: Address) => {
    if (!proxyAddress) {
      const proxyPrompt = await addressPrompt(
        'Enter proxy contract address',
        'proxy',
      );
      proxyAddress = proxyPrompt.proxy as Address;
    }

    const proxyContract = await getOssifiableProxyContract(proxyAddress);
    const admin = await callReadMethodSilent({
      contract: proxyContract,
      methodName: 'proxy__getAdmin',
      payload: [],
    });

    logResult({
      data: [
        ['Proxy Address', proxyAddress],
        ['Admin', admin],
      ],
    });
  });

proxyRead
  .command('get-implementation')
  .description('get the implementation address of a proxy contract')
  .argument('[proxy]', 'proxy contract address', stringToAddress)
  .action(async (proxyAddress?: Address) => {
    if (!proxyAddress) {
      const proxyPrompt = await addressPrompt(
        'Enter proxy contract address',
        'proxy',
      );
      proxyAddress = proxyPrompt.proxy as Address;
    }

    const proxyContract = await getOssifiableProxyContract(proxyAddress);
    const implementation = await callReadMethodSilent({
      contract: proxyContract,
      methodName: 'proxy__getImplementation',
      payload: [],
    });

    logResult({
      data: [
        ['Proxy Address', proxyAddress],
        ['Implementation', implementation],
      ],
    });
  });

proxyRead
  .command('get-is-ossified')
  .description('check if a proxy contract is ossified (permanently locked)')
  .argument('[proxy]', 'proxy contract address', stringToAddress)
  .action(async (proxyAddress?: Address) => {
    if (!proxyAddress) {
      const proxyPrompt = await addressPrompt(
        'Enter proxy contract address',
        'proxy',
      );
      proxyAddress = proxyPrompt.proxy as Address;
    }

    const proxyContract = await getOssifiableProxyContract(proxyAddress);
    const isOssified = await callReadMethodSilent({
      contract: proxyContract,
      methodName: 'proxy__getIsOssified',
      payload: [],
    });

    logResult({
      data: [
        ['Proxy Address', proxyAddress],
        ['Is Ossified', isOssified ? '✅ Yes' : '❌ No'],
      ],
    });
  });

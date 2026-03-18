import {
  Address,
  erc20Abi,
  formatUnits,
  getContract,
  Hash,
  isAddressEqual,
  parseUnits,
} from 'viem';
import { Option } from 'commander';
import {
  logInfo,
  getCommandsJson,
  stringToAddress,
  logError,
  confirmOperation,
  callWriteMethodWithReceipt,
  stringArrayToAddressArray,
  calculateIPFSAddCID,
  stringToHash,
  stringToBigInt,
  stringArrayToTokenPairs,
  pinToIPFS,
  logResult,
} from 'utils';
import {
  getDistributorContract,
  getStvPoolContract,
} from 'contracts/defi-wrapper/index.js';

import { distributorUseCases } from './main.js';
import { getPublicClient } from 'providers/wallet.js';
import { generateDistribution } from 'features/defi-wrapper/distributor.js';
import path from 'path';
import fs from 'fs/promises';

const distributorWrite = distributorUseCases
  .command('write')
  .aliases(['w'])
  .description('distributor operations write commands');

distributorWrite.addOption(new Option('-cmd2json'));
distributorWrite.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(distributorWrite));
  process.exit();
});

distributorWrite
  .command('add-token')
  .description('add a new token to distribute')
  .argument('<pool address>', 'pool contract address', stringToAddress)
  .argument('<token address>', 'ERC20 token address', stringToAddress)
  .action(async (poolAddress: Address, tokenAddress: Address) => {
    const publicClient = await getPublicClient();
    const poolContract = await getStvPoolContract(poolAddress);
    const distributorAddress = await poolContract.read.DISTRIBUTOR();
    const distributorContract =
      await getDistributorContract(distributorAddress);
    const tokenContract = getContract({
      address: tokenAddress,
      abi: erc20Abi,
      client: publicClient,
    });

    const tokens = await distributorContract.read.getTokens();

    if (
      tokens.some((existingToken) =>
        isAddressEqual(existingToken, tokenAddress),
      )
    ) {
      logError(`Token ${tokenAddress} is already added to distributor.`);
      return;
    }

    const [name, symbol] = await Promise.all([
      tokenContract.read.name(),
      tokenContract.read.symbol(),
    ]);

    const confirm = await confirmOperation(
      `Add token ${name} (${symbol}) at ${tokenAddress} to distributor at ${distributorAddress} for pool ${poolAddress}?`,
    );

    if (!confirm) {
      return;
    }

    await callWriteMethodWithReceipt({
      contract: distributorContract,
      methodName: 'addToken',
      payload: [tokenAddress],
    });
  });

distributorWrite
  .command('set-merkle-root')
  .argument('<pool address>', 'pool contract address', stringToAddress)
  .argument('<merkle root>', 'merkle root', stringToHash)
  .argument('<cid>', 'cid')
  .action(async (poolAddress: Address, merkleRoot: Hash, cid: string) => {
    const pool = await getStvPoolContract(poolAddress);
    const distributorAddress = await pool.read.DISTRIBUTOR();
    const distributor = await getDistributorContract(distributorAddress);

    const confirmationMessage = `Are you sure you want to set the Merkle root ${merkleRoot} and CID ${cid} on distributor at ${distributorAddress}?`;
    const confirm = await confirmOperation(confirmationMessage);
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract: distributor,
      methodName: 'setMerkleRoot',
      payload: [merkleRoot, cid],
    });
  });

type DistributeOptions = {
  blacklist: Address[];
  outputPath?: string;
  skipTransfer: boolean;
  upload?: string;
  uploadAuthorization?: string;
  skipSetRoot: boolean;
  skipWrite: boolean;
  fromBlock?: bigint;
  toBlock?: bigint;
  ipfsGateway?: string;
  maxBatchSize: bigint;
};

distributorWrite
  .command('distribute')
  .description('generate distribution data')
  .argument('<pool address>', 'pool contract address', stringToAddress)
  .argument(
    '<tokens...>',
    'ERC20 token addresses and amounts to distribute,e.g.  0x... 123.15 0x... 456.78',
    stringArrayToTokenPairs,
  )
  .option(
    '--blacklist [addresses...]',
    'addresses to blacklist from distribution',
    stringArrayToAddressArray,
    [],
  )
  .option(
    '--from-block [block]',
    'from block number',
    stringToBigInt,
    undefined,
  )
  .option('--to-block [block]', 'to block number', stringToBigInt, undefined)
  .option(
    '--max-batch-size [size]',
    'maximum batch size for fetching events',
    stringToBigInt,
    50_000n,
  )
  .option('--output-path [path]', 'path to save distribution data')
  .option('--skip-write', 'skip writing distribution data to file', false)
  .option('--skip-transfer', 'skip transferring tokens to distributor', false)
  .option(
    '--ipfs-gateway [gateway]',
    'IPFS gateway to fetch previous data from',
  )
  .option(
    '--upload [pinningUrl]',
    '(unstable) uploading distribution data to provided pinning service URL',
    false,
  )
  .option(
    '--upload-authorization [token]',
    'authorization token for uploading distribution data to pinning service, used as `Authorization: Bearer <token>`',
  )
  .option('--skip-set-root', 'skip setting merkle root on distributor', false)
  .action(
    async (
      poolAddress: Address,
      tokensArgs: ReturnType<typeof stringArrayToTokenPairs>,
      {
        blacklist,
        outputPath,
        skipTransfer,
        upload,
        uploadAuthorization,
        skipSetRoot,
        skipWrite,
        fromBlock,
        toBlock,
        ipfsGateway,
        maxBatchSize,
      }: DistributeOptions,
    ) => {
      const publicClient = await getPublicClient();
      const tokens = await Promise.all(
        tokensArgs.result.map(async (tokenArg) => {
          const contract = getContract({
            address: tokenArg.address,
            abi: erc20Abi,
            client: publicClient,
          });
          const decimals = await contract.read.decimals();
          const name = await contract.read.name();
          const symbol = await contract.read.symbol();
          return {
            contract,
            amount: parseUnits(tokenArg.amount, decimals),
            name,
            symbol,
            decimals,
          };
        }),
      );

      logInfo(
        `Generating distribution for pool ${poolAddress}. Use paid or local RPC node for better performance and history access.`,
      );
      const {
        cidPrev,
        distributorAddress,
        merkleTree,
        newDistributed,
        newProcessedBlock,
        totalDistributed,
      } = await generateDistribution({
        poolAddress,
        blacklist,
        toBlock,
        fromBlock,
        ipfsGateway,
        maxBatchSize,
        tokens: tokens.map((t) => ({
          address: t.contract.address,
          amount: t.amount,
        })),
      });

      const dataToWrite = {
        prevTreeCid: cidPrev,
        blockNumber: newProcessedBlock.toString(),
        timestamp: Date.now(),
        totalDistributed,
        newDistributed,
        ...merkleTree.dump(),
      };

      const writeString = JSON.stringify(dataToWrite, (_, value) =>
        typeof value === 'bigint' ? value.toString() : value,
      );

      const encoder = new TextEncoder();
      const distributionCID = await calculateIPFSAddCID(
        encoder.encode(writeString),
      );
      const CidV0 = distributionCID.toV0().toString();

      logInfo(`Calculated new distribution data CID: ${CidV0}`);
      logResult({
        data: [
          ['Merkle Root', merkleTree.root],
          ['CID', distributionCID.toString()],
          ['CID (v0)', CidV0],
          ['CID (v1)', distributionCID.toV1().toString()],
        ],
      });

      // writing distribution data to file
      if (!skipWrite) {
        // write distribution data to output path
        outputPath = outputPath ?? `./distribution-${merkleTree.root}.json`;
        const dir = path.dirname(outputPath);

        await fs.mkdir(dir, { recursive: true });

        await fs.writeFile(outputPath, writeString, 'utf-8');

        logInfo(`Distribution data written to ${outputPath}`);
      }

      // transferring exact tokens to distributor
      if (!skipTransfer) {
        // top up balances of distributor
        for (const token of tokens) {
          const toBeDistributed = newDistributed[token.contract.address];
          if (toBeDistributed === undefined) continue;
          const toBeFormatted = formatUnits(toBeDistributed, token.decimals);
          const initialAmountFormatted = formatUnits(
            token.amount,
            token.decimals,
          );
          logInfo(
            `Token ${token.name} (${token.symbol}) at ${token.contract.address} - Distributing total of ${toBeFormatted}/${initialAmountFormatted}`,
          );

          const confirm = await confirmOperation(
            `Transfer ${toBeFormatted} ${token.name} to distributor?`,
          );

          if (confirm) {
            await callWriteMethodWithReceipt({
              contract: token.contract,
              methodName: 'transfer',
              payload: [distributorAddress, toBeDistributed],
            });
          }
        }
      } else {
        logInfo(`Skipping transfer of tokens to distributor as requested.`);
      }

      if (upload) {
        logInfo(
          '⚠️⚠️⚠️ Uploading distribution API is unstable, use manual upload to IPFS and choose CIDv0. ⚠️⚠️⚠️',
        );
        try {
          const uploadResponse = await pinToIPFS({
            fileContent: writeString,
            uploadUrl: upload,
            uploadAuthorization,
            fileName: `distribution-${merkleTree.root}.json`,
          });
          logInfo('Distribution uploaded to IPFS provider', uploadResponse);
        } catch (error) {
          logError('Failed to upload distribution data to IPFS', error);
        }
      }

      if (!skipSetRoot) {
        const cidV0 = distributionCID.toV0().toString();

        const confirm = await confirmOperation(
          `Set new Merkle root ${merkleTree.root} and CID ${cidV0} on distributor at ${distributorAddress}?`,
        );

        if (confirm) {
          await callWriteMethodWithReceipt({
            contract: await getDistributorContract(distributorAddress),
            methodName: 'setMerkleRoot',
            payload: [merkleTree.root as Hash, cidV0],
          });
        }
      }
    },
  );

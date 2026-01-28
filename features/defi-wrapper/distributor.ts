import { StandardMerkleTree } from '@openzeppelin/merkle-tree';
import { getDistributorContract } from 'contracts/defi-wrapper/distributor.js';
import {
  getStvPoolContract,
  StvPoolContract,
} from 'contracts/defi-wrapper/stv-pool.js';
import { getPublicClient } from 'providers';
import { fetchIPFS } from 'utils';
import { Address, zeroAddress, zeroHash } from 'viem';

type GenerateDistributionParams = {
  poolAddress: Address;
  tokens: {
    address: Address;
    amount: bigint;
  }[];
  blacklist?: Address[];
  ipfsGateway?: string;
  toBlock?: bigint;
  fromBlock?: bigint;
};

export type MerkleDistributionResult = {
  format: 'standard-v1';
  leafEncoding: ['address', 'address', 'uint256'];
  tree: string[];
  values: {
    treeIndex: bigint;
    value: [string, string, string];
  }[];
  prevTreeCid: string;
  blockNumber: number;
};

const treeFromData = (data: any) => {
  return StandardMerkleTree.load<[Address, Address, bigint]>({
    ...data,
    leafEncoding: ['address', 'address', 'uint256'] as const,
  });
};

const treeFromValues = (values: [Address, Address, bigint][]) => {
  if (values.length === 0) {
    throw new Error('No values to generate Merkle Tree with');
  }
  return StandardMerkleTree.of(values, ['address', 'address', 'uint256']);
};

const getUserShares = async (
  poolContract: StvPoolContract,
  blackListSet: Set<Address>,
  fromBlock: bigint,
  toBlock: bigint,
) => {
  const userSharesMap: Map<
    Address,
    { accumulatedShare: bigint; balance: bigint; lastBlock: bigint }
  > = new Map();

  const blockBeforeFrom = fromBlock > 0n ? fromBlock - 1n : 0n;

  const eventsBefore = await poolContract.getEvents.Transfer(undefined, {
    fromBlock: 'earliest',
    toBlock: blockBeforeFrom,
    strict: true,
  });

  // accumulate balances before fromBlock as well as whole user base
  // parsing ALL events from contract creation  is the only way to get full and correct user list
  for (const event of eventsBefore) {
    const args = event.args as Required<typeof event.args>;
    const to = args.to.toLowerCase() as Address;
    const from = args.from.toLowerCase() as Address;
    const value = args.value;

    const old = userSharesMap.get(to);
    if (!blackListSet.has(to)) {
      userSharesMap.set(to, {
        accumulatedShare: 0n,
        balance: (old?.balance ?? 0n) + value,
        lastBlock: blockBeforeFrom,
      });
    }
    if (!blackListSet.has(from)) {
      userSharesMap.set(from, {
        accumulatedShare: 0n,
        balance: (old?.balance ?? 0n) - value,
        lastBlock: blockBeforeFrom,
      });
    }
  }

  const events = await poolContract.getEvents.Transfer(undefined, {
    fromBlock,
    toBlock,
    strict: true,
  });

  // accumulate balances and shares between fromBlock and toBlock
  // each user's share is balance * number of blocks held since last change
  for (const event of events) {
    const args = event.args as Required<typeof event.args>;
    const to = args.to.toLowerCase() as Address;
    const from = args.from.toLowerCase() as Address;
    const value = args.value;
    const currentBlock = event.blockNumber;

    if (!blackListSet.has(to)) {
      const lastValue = userSharesMap.get(to);
      const lastBalance = lastValue?.balance ?? 0n;
      const lastBlock = lastValue?.lastBlock ?? blockBeforeFrom;
      const lastAccumulatedShare = lastValue?.accumulatedShare ?? 0n;

      userSharesMap.set(to, {
        accumulatedShare:
          lastBalance * (currentBlock - lastBlock) + lastAccumulatedShare,
        balance: lastBalance + value,
        lastBlock: currentBlock,
      });
    }
    if (!blackListSet.has(from)) {
      const lastValue = userSharesMap.get(from);
      const lastBalance = lastValue?.balance ?? 0n;
      const lastBlock = lastValue?.lastBlock ?? blockBeforeFrom;
      const lastAccumulatedShare = lastValue?.accumulatedShare ?? 0n;
      userSharesMap.set(from, {
        accumulatedShare:
          lastBalance * (currentBlock - lastBlock) + lastAccumulatedShare,
        balance: lastBalance - value,
        lastBlock: currentBlock,
      });
    }
  }

  // last pass to accumulate shares until toBlock
  // user who had no events in the period will get their full balance counted from fromBlock to toBlock
  // denominator is total shares to be used in distribution calculation
  let denominator = 0n;
  for (const [address, info] of userSharesMap) {
    const lastBalance = info.balance;
    const lastBlock = info.lastBlock;

    const newShare =
      lastBalance * (toBlock - lastBlock) + info.accumulatedShare;
    userSharesMap.set(address, {
      accumulatedShare: newShare,
      balance: lastBalance,
      lastBlock: lastBlock,
    });
    denominator += newShare;
  }

  return { userSharesMap, denominator };
};

export const generateDistribution = async ({
  tokens: tokensArg,
  poolAddress,
  blacklist = [],
  toBlock,
  fromBlock,
  ipfsGateway,
}: GenerateDistributionParams) => {
  // Contracts
  const publicClient = await getPublicClient();
  const pool = await getStvPoolContract(poolAddress);
  const distributorAddress = await pool.read.DISTRIBUTOR();
  const withdrawalQueueAddress = await pool.read.WITHDRAWAL_QUEUE();
  const distributor = await getDistributorContract(distributorAddress);

  // Blacklist
  const blackListSet = new Set(
    blacklist.map((addr) => addr.toLowerCase() as Address),
  );
  [
    distributorAddress,
    withdrawalQueueAddress,
    poolAddress,
    zeroAddress,
  ].forEach((address) => blackListSet.add(address.toLowerCase() as Address));

  const fromBlockNumber =
    fromBlock ?? (await distributor.read.lastProcessedBlock());
  const currentBlock = await publicClient.getBlock({
    blockNumber: toBlock,
    blockTag: toBlock ? 'latest' : undefined,
    // getBlock does not allow double options, so we cast to any
  } as any);

  if (fromBlockNumber >= currentBlock.number) {
    throw new Error(
      `No new blocks to process. Last processed block: ${fromBlockNumber}, current block: ${currentBlock.number}`,
    );
  }

  //Prev distribution data
  const cidPrev = await distributor.read.cid();
  const merkleRootPrev = await distributor.read.root();
  let treePrev: ReturnType<typeof treeFromData> | null = null;
  if (cidPrev === '' && merkleRootPrev !== zeroHash) {
    const dataPrev = await fetchIPFS({
      cid: cidPrev,
      bigNumberType: 'bigint',
      gateway: ipfsGateway,
    });
    treePrev = treeFromData(dataPrev);

    if (merkleRootPrev !== treePrev.root) {
      throw new Error(
        `Previous distribution data from IPFS(${cidPrev}) does not match the on-chain merkle root(${merkleRootPrev})`,
      );
    }
  }

  // Create map of previous claims for cumulative calculation
  const prevClaims = new Map<Address, Map<Address, bigint>>();
  if (treePrev) {
    for (const [_, value] of treePrev.entries()) {
      const recipient = value[0].toLowerCase() as Address;
      const token = value[1].toLowerCase() as Address;
      const amount = value[2];
      let claim = prevClaims.get(recipient);
      if (!claim) {
        claim = prevClaims.set(recipient, new Map()).get(recipient) as Map<
          Address,
          bigint
        >;
      }
      claim.set(token, amount);
    }
  }

  const { userSharesMap, denominator } = await getUserShares(
    pool,
    blackListSet,
    fromBlockNumber + 1n,
    BigInt(currentBlock.number),
  );

  const newMerkleValues: [Address, Address, bigint][] = [];

  const totalDistributed: Record<Address, bigint> = {};
  const newDistributed: Record<Address, bigint> = {};

  // for all users accounted for in the distribution period
  for (const [userAddress, { accumulatedShare }] of userSharesMap) {
    // for all tokens to distribute
    for (const { address: tokenAddress, amount: tokenAmount } of tokensArg) {
      const prevClaim = prevClaims.get(userAddress)?.get(tokenAddress);
      const hasPrevClaim = prevClaim !== undefined;

      // new amount is previous claim + newly accumulated share portion
      const newAmount =
        (prevClaim ?? 0n) + (accumulatedShare * tokenAmount) / denominator;

      // clean up previous claim entry, what's left over will be added as is
      if (hasPrevClaim) {
        prevClaims.get(userAddress)?.delete(tokenAddress);
        if (prevClaims.get(userAddress)?.size === 0) {
          prevClaims.delete(userAddress);
        }
      }

      if (newAmount === 0n) {
        continue; //skip zero amounts
      }

      newMerkleValues.push([userAddress, tokenAddress, newAmount]);
      totalDistributed[tokenAddress] =
        (totalDistributed[tokenAddress] ?? 0n) + newAmount;
      newDistributed[tokenAddress] =
        (newDistributed[tokenAddress] ?? 0n) + newAmount;
    }
  }

  // mix in unaltered previous claims
  for (const [address, tokenMap] of prevClaims.entries()) {
    for (const [tokenAddress, amount] of tokenMap.entries()) {
      if (amount === 0n) {
        continue; //skip zero amounts
      }
      newMerkleValues.push([address, tokenAddress, amount]);
      totalDistributed[tokenAddress] =
        (totalDistributed[tokenAddress] ?? 0n) + amount;
    }
  }

  newMerkleValues.sort((a, b) => {
    const addrCompare = a[0].localeCompare(b[0]);
    if (addrCompare !== 0) return addrCompare;
    return a[1].localeCompare(b[1]);
  });

  const merkleTree = treeFromValues(newMerkleValues);

  return {
    distributorAddress,
    cidPrev,
    merkleRootPrev,
    newProcessedBlock: BigInt(currentBlock.number),
    merkleTree,
    totalDistributed,
    // this will be the source of truth for transfer txs amounts due to Apportionment Problem
    newDistributed,
  };
};

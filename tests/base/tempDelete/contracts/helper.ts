import {
  Account,
  Address,
  keccak256,
  toHex,
  pad,
  encodePacked,
  parseEther,
  createWalletClient,
  http,
} from 'viem';
import { getTestClient } from '../../providers';
import {
  PROPOSAL_STATUS,
  getProposalDetails,
  getAfterSubmitDelay,
  getAfterScheduleDelay,
  canExecute,
  executeProposal,
} from './dgEmergencyProtectedTimeLockContract';
import {
  canScheduleProposal,
  scheduleProposal,
  waitForNormalState,
} from './dualGovernanceContract';
import { getStandConfig, getChain, getElUrl } from '../../config';
import { vote, canVote } from './aragonVotingContract';
import { getLdoTokenBalanceAt } from './ldoTokenContract';

// Wait for target time to satisfy time constraints (16:00 UTC)
const waitForTargetTimeToSatisfyTimeConstraints = async (): Promise<void> => {
  const testClient = getTestClient();
  const block = await testClient.getBlock();
  const currentTime = BigInt(block.timestamp);

  const targetTime = 16n * 60n * 60n; // 16:00 UTC
  const secondsPerDay = 24n * 60n * 60n;

  const dayStart = currentTime - (currentTime % secondsPerDay);
  const todayTargetTime = dayStart + targetTime;

  let targetTimeValue: bigint;
  if (currentTime >= todayTargetTime) {
    targetTimeValue = todayTargetTime + secondsPerDay;
  } else {
    targetTimeValue = todayTargetTime;
  }

  const sleepTime = targetTimeValue - currentTime;
  if (sleepTime > 0n) {
    await testClient.increaseTime({ seconds: Number(sleepTime) });
    await testClient.mine({ blocks: 1 });
  }
};

// Votes through multiple impersonated addresses that already had LDO at snapshotBlock
export const voteWithImpersonatedAccounts = async (
  voteId: bigint,
  support: boolean,
  snapshotBlock: bigint,
) => {
  const testClient = getTestClient();

  for (const whaleAddress of LDO_WHALE_ADDRESSES) {
    let impersonated = false;
    try {
      const balanceAtSnapshot = await getLdoTokenBalanceAt(
        whaleAddress,
        snapshotBlock,
      );

      if (balanceAtSnapshot === 0n) {
        continue;
      }

      // Check if can vote
      const canVoteResult = await canVote(voteId, whaleAddress);

      if (!canVoteResult) {
        continue;
      }

      await testClient.impersonateAccount({
        address: whaleAddress,
      });
      impersonated = true;

      await testClient.setBalance({
        address: whaleAddress,
        value: parseEther('10'),
      });

      const walletClient = createWalletClient({
        account: whaleAddress,
        chain: getChain(),
        transport: http(getElUrl()),
      });

      await vote(walletClient.account, voteId, support, true);

      await testClient.stopImpersonatingAccount({
        address: whaleAddress,
      });
      impersonated = false;
    } catch (error: any) {
      if (impersonated) {
        try {
          await testClient.stopImpersonatingAccount({
            address: whaleAddress,
          });
        } catch {
          // Ignore impersonation stop error
        }
      }
    }
  }
};

// Process proposals: schedule submitted proposals and execute scheduled proposals
export const processProposals = async (
  account: Account,
  proposalIds: bigint[],
): Promise<void> => {
  const proposalsToBeProcessed = [...proposalIds];
  const submittedProposals: bigint[] = [];
  const scheduledProposals: bigint[] = [];

  const copyProposalsToBeProcessed = [...proposalsToBeProcessed];
  for (const proposalId of copyProposalsToBeProcessed) {
    const proposalDetails = await getProposalDetails(proposalId);
    const proposalStatus = proposalDetails.status;

    if (proposalStatus === PROPOSAL_STATUS.submitted) {
      submittedProposals.push(proposalId);
      proposalsToBeProcessed.splice(
        proposalsToBeProcessed.indexOf(proposalId),
        1,
      );
    } else if (proposalStatus === PROPOSAL_STATUS.scheduled) {
      scheduledProposals.push(proposalId);
      proposalsToBeProcessed.splice(
        proposalsToBeProcessed.indexOf(proposalId),
        1,
      );
    } else if (
      proposalStatus === PROPOSAL_STATUS.executed ||
      proposalStatus === PROPOSAL_STATUS.cancelled
    ) {
      proposalsToBeProcessed.splice(
        proposalsToBeProcessed.indexOf(proposalId),
        1,
      );
    }
  }

  if (submittedProposals.length > 0) {
    const afterSubmitDelay = await getAfterSubmitDelay();
    const testClient = getTestClient();

    await testClient.increaseTime({ seconds: Number(afterSubmitDelay) + 1 });
    await testClient.mine({ blocks: 1 });

    const firstProposalId = submittedProposals[0];
    if (!firstProposalId) {
      throw new Error('No proposals to schedule');
    }

    let iterations = 0;
    const MAX_ITERATIONS = 100;

    while (!(await canScheduleProposal(firstProposalId))) {
      await waitForNormalState();
      iterations += 1;
      if (iterations > MAX_ITERATIONS) {
        throw new Error(
          `Unable to schedule the proposal. (${firstProposalId})`,
        );
      }
    }

    for (const proposalId of submittedProposals) {
      await scheduleProposal(account, proposalId);
      scheduledProposals.push(proposalId);
    }
  }

  if (scheduledProposals.length > 0) {
    const afterScheduleDelay = await getAfterScheduleDelay();
    const testClient = getTestClient();

    await testClient.increaseTime({ seconds: Number(afterScheduleDelay) + 1 });
    await testClient.mine({ blocks: 1 });

    await waitForTargetTimeToSatisfyTimeConstraints();

    for (const proposalId of scheduledProposals) {
      const canExec = await canExecute(proposalId);

      if (!canExec) {
        const proposalDetails = await getProposalDetails(proposalId);
        const currentBlock = await testClient.getBlock();
        const currentTimestamp = BigInt(currentBlock.timestamp);
        throw new Error(
          `Proposal ${proposalId} cannot be executed. Status: ${proposalDetails.status}, submittedAt: ${proposalDetails.submittedAt}, scheduledAt: ${proposalDetails.scheduledAt}, currentTime: ${currentTimestamp}, afterScheduleDelay: ${afterScheduleDelay}`,
        );
      }

      await executeProposal(account, proposalId);

      const proposalDetails = await getProposalDetails(proposalId);

      if (proposalDetails.status !== PROPOSAL_STATUS.executed) {
        throw new Error(`Proposal ${proposalId} execution failed`);
      }
    }
  }

  if (proposalsToBeProcessed.length > 0) {
    throw new Error(
      `Unable to process proposals: ${proposalsToBeProcessed.join(', ')}. Proposals are already processed or cancelled.`,
    );
  }
};

// Get implementation address from proxy contract using EIP-1967 storage slot
const getProxyImplementation = async (
  proxyAddress: Address,
): Promise<Address> => {
  const testClient = getTestClient();

  // EIP-1967 implementation storage slot: keccak256("eip1967.proxy.implementation") - 1
  // In Solidity: bytes32(uint256(keccak256("eip1967.proxy.implementation")) - 1)
  const slotString = encodePacked(['string'], ['eip1967.proxy.implementation']);
  const slotHash = keccak256(slotString);

  // Subtract 1 from the slot (EIP-1967 standard)
  const slotBigInt = BigInt(slotHash);
  const slot = pad(toHex(slotBigInt - 1n, { size: 32 }), { size: 32 });

  const storageValue = await testClient.getStorageAt({
    address: proxyAddress,
    slot,
  });

  if (
    !storageValue ||
    storageValue ===
      '0x0000000000000000000000000000000000000000000000000000000000000000'
  ) {
    throw new Error(`Implementation not found for proxy ${proxyAddress}`);
  }

  // Extract address from storage (last 20 bytes)
  const implementationAddress = '0x' + storageValue.slice(-40);
  return implementationAddress as Address;
};

// Check that LidoLocator implementation has changed to expected address
export const checkLidoLocatorImplementation = async (
  expectedImplementation: Address,
): Promise<void> => {
  const lidoLocatorAddress = getStandConfig().contracts.lidoLocator;
  const currentImplementation =
    await getProxyImplementation(lidoLocatorAddress);

  if (
    currentImplementation.toLowerCase() !== expectedImplementation.toLowerCase()
  ) {
    throw new Error(
      `LidoLocator implementation mismatch. Expected: ${expectedImplementation}, Got: ${currentImplementation}`,
    );
  }
};

// Addresses that already had LDO balance at the time of vote creation
export const LDO_WHALE_ADDRESSES: readonly Address[] = [
  '0x8Fa129F87B8a11ee1ca35Abd46674F8b66984d4a',
  '0xAD4f7415407B83a081A0Bee22D05A8FDC18B42da',
] as const;

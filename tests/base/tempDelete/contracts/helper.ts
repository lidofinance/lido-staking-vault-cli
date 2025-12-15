import { Account } from 'viem';
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

// Process proposals: schedule submitted proposals and execute scheduled proposals
export const processProposals = async (
  account: Account,
  proposalIds: bigint[],
): Promise<void> => {
  const proposalsToBeProcessed = [...proposalIds];
  const submittedProposals: bigint[] = [];
  const scheduledProposals: bigint[] = [];

  // Check status of each proposal
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

  // Process submitted proposals
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

  // Process scheduled proposals
  if (scheduledProposals.length > 0) {
    const afterScheduleDelay = await getAfterScheduleDelay();
    const testClient = getTestClient();

    // Wait for afterScheduleDelay after scheduling
    await testClient.increaseTime({ seconds: Number(afterScheduleDelay) + 1 });
    await testClient.mine({ blocks: 1 });

    // Wait for target time to satisfy time constraints (16:00 UTC)
    await waitForTargetTimeToSatisfyTimeConstraints();

    // Execute proposals - check canExecute before executing
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

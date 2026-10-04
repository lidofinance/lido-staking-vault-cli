export const dgEmergencyProtectedTimeLockErrorsAbi = [
  {
    inputs: [],
    name: 'EmptyCalls',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'proposalId', type: 'uint256' },
      { internalType: 'enum Status', name: 'status', type: 'uint8' },
    ],
    name: 'UnexpectedProposalStatus',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'proposalId', type: 'uint256' }],
    name: 'AfterSubmitDelayNotPassed',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'proposalId', type: 'uint256' }],
    name: 'AfterScheduleDelayNotPassed',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'proposalId', type: 'uint256' }],
    name: 'MinExecutionDelayNotPassed',
    type: 'error',
  },
] as const;

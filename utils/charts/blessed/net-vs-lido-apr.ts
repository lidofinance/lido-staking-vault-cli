import { LINE_COLORS } from './constants.js';

const buildNetVsLidoAPRChart = ({
  netStakingAPR,
  lidoAPR,
  timeLabels,
}: {
  netStakingAPR: number[];
  lidoAPR: number[];
  timeLabels: string[];
}) => {
  return [
    {
      title: 'Net Staking APR',
      x: timeLabels,
      y: netStakingAPR,
      style: { line: LINE_COLORS.netStakingAPR },
    },
    {
      title: 'Lido APR',
      x: timeLabels,
      y: lidoAPR,
      style: { line: LINE_COLORS.lidoAPR },
    },
  ];
};

export { buildNetVsLidoAPRChart };

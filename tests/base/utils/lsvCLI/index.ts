import * as factory from './programs/factory';
import * as dashboard from './programs/dashboard';
import * as operatorGrid from './programs/operatorGrid';
import * as vo from './programs/vo';
import * as hub from './programs/hub';
import * as pdg from './programs/pdg';

const lsvCLI = {
  factory: {
    createVaultConnectedToVh: factory.createVaultConnectedToVh,
  },
  dashboard: {
    grantRole: dashboard.grantRole,
    supplyVault: dashboard.supplyVault,
    overview: dashboard.overview,
    minimalReserve: dashboard.minimalReserve,
  },
  operatorGrid: {
    getVaultInfo: operatorGrid.getVaultInfo,
    getGroup: operatorGrid.getGroup,
  },
  vo: {
    changeTierAsVM: vo.changeTierAsVM,
    changeTierByNO: vo.changeTierByNO,
    supply: vo.fund,
    mintStEth: vo.mintStEth,
    burnStEth: vo.burnStEth,
    withdraw: vo.withdraw,
  },
  hub: {
    isVaultConnected: hub.isVaultConnected,
    isReportFresh: hub.isReportFresh,
    latestReportData: hub.latestReportData,
  },
  pdg: {
    getPDGInfo: pdg.getPDGInfo,
  },
};

export default lsvCLI;

export * from './types';
export { cleanAnsi, runCLICommand } from './helpers';

import { AsyncLocalStorage } from 'node:async_hooks';
import { Config } from 'types';

import { logInfo } from 'utils';

const advancedConfigStore = new AsyncLocalStorage<{
  config: Config | null;
}>();
advancedConfigStore.enterWith({ config: null });

export const getAdvancedConfig = () => {
  const store = advancedConfigStore.getStore();
  logInfo('getAdvancedConfig::store', store);
  return store;
};

export const setAdvancedConfig = async (payload: Config) => {
  const store = getAdvancedConfig();
  if (store) {
    store.config = payload;
  }

  logInfo('setAdvancedConfig::store', store);
};

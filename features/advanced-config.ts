import { AsyncLocalStorage } from 'node:async_hooks';
import { JSONConfig } from 'types';

import { logInfo } from 'utils';

const advancedConfigStore = new AsyncLocalStorage<{
  config: JSONConfig | null;
}>();
advancedConfigStore.enterWith({ config: null });

export const getAdvancedConfig = () => {
  const store = advancedConfigStore.getStore();
  logInfo('getAdvancedConfig::store', store);
  return store;
};

export const setAdvancedConfig = async (payload: JSONConfig) => {
  const store = getAdvancedConfig();
  if (store) {
    store.config = payload;
  }

  logInfo('setAdvancedConfig::store', store);
};

import { AsyncLocalStorage } from 'node:async_hooks';
import { JSONConfig } from 'types';

const advancedConfigStore = new AsyncLocalStorage<{
  config: JSONConfig | null;
}>();
advancedConfigStore.enterWith({ config: null });

export const getAdvancedConfig = () => {
  const store = advancedConfigStore.getStore();
  console.info('getAdvancedConfig::store', store);
  return store;
};

export const setAdvancedConfig = async (payload: JSONConfig) => {
  const store = getAdvancedConfig();
  if (store) {
    store.config = payload;
  }

  console.info('setAdvancedConfig::store', store);
};

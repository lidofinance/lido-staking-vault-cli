import path from 'path';
import { config as envConfig } from 'dotenv';

envConfig({ path: path.resolve(__dirname, '../.env') });

class LsvCliEnvs {
  CHAIN_ID!: string;

  constructor() {
    this.validateEnv();
  }

  private validateEnv() {
    const { CHAIN_ID } = process.env;

    if (!CHAIN_ID) {
      throw new Error('Missing required env variable: CHAIN_ID');
    }

    this.CHAIN_ID = CHAIN_ID;
  }
}

export const ENV_CONFIG = new LsvCliEnvs();

import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import 'hardhat-ignore-warnings';

import * as dotenv from 'dotenv';

dotenv.config({ path: '.env', quiet: true });
import './tasks';

const getNetworkConfig = (networkName: string) => {
  const network = networkName.toUpperCase();
  return {
    url: process.env[`${network}_NODE_URL`] || '',
    accounts: process.env[`${network}_PRIVATE_KEY`]?.split(','),
    timeout: 60000,
  };
};

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.28',
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  networks: {
    local: {
      url: process.env[`LOCAL_NODE_URL`] || 'http://localhost:8545/',
      accounts: {
        mnemonic: 'test test test test test test test test test test test junk',
      },

    },
    sepolia: getNetworkConfig('sepolia'),
    ethereum: getNetworkConfig('ethereum'),
  },
  gasReporter: {
    enabled: !!process.env.REPORT_GAS && process.env.REPORT_GAS !== 'false',
    currency: 'USD',
    excludeContracts: ['TestBridge', 'Token'],
  },
  warnings: {
    '*': {
      default: 'warn',
    },
    'contracts/test/**/*': {
      default: 'off',
    },
  },
};

export default config;

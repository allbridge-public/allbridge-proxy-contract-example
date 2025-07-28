const dotenv = require('dotenv');
const {DEVELOPMENT_NETWORK, NILE_NETWORK, SHASTA_NETWORK, TRON_NETWORK, DEVELOPMENT_PRIVATE_KEY} = require("./consts");
const port = process.env.HOST_PORT || 9090;

dotenv.config({ path: '.env', quiet: true });

module.exports = {
  networks: {
    [TRON_NETWORK]: {
      // Don't put your private key here:
      privateKey: process.env.TRON_PRIVATE_KEY,
      /**
       * Create a .env file (it must be gitignored) containing something like
       *
       *   export TRON_PRIVATE_KEY=4E7FEC...656243
       *
       * Then, run the migration with:
       *
       *   tronbox migrate --network tron
       */
      userFeePercentage: 100,
      feeLimit: 1000 * 1e6,
      fullHost: 'https://api.trongrid.io',
      network_id: '1'
    },
    [SHASTA_NETWORK]: {
      // Obtain test coin at https://shasta.tronex.io/
      privateKey: process.env.SHASTA_PRIVATE_KEY,
      userFeePercentage: 50,
      feeLimit: 1000 * 1e6,
      fullHost: 'https://api.shasta.trongrid.io',
      network_id: '2'
    },
    [NILE_NETWORK]: {
      // Obtain test coin at https://nileex.io/join/getJoinPage
      privateKey: process.env.NILE_PRIVATE_KEY,
      userFeePercentage: 100,
      feeLimit: 1000 * 1e6,
      fullHost: 'https://nile.trongrid.io',
      network_id: '3'
    },
    [DEVELOPMENT_NETWORK]: {
      // For tronbox/tre docker image
      // See https://hub.docker.com/r/tronbox/tre
      privateKey: process.env.DEVELOPMENT_PRIVATE_KEY || DEVELOPMENT_PRIVATE_KEY,
      userFeePercentage: 0,
      feeLimit: 1000 * 1e6,
      fullHost: 'http://127.0.0.1:' + port,
      network_id: '9'
    }
  },
  compilers: {
    solc: {
      version: '0.8.23',
      // An object with the same schema as the settings entry in the Input JSON.
      // See https://docs.soliditylang.org/en/latest/using-the-compiler.html#input-description
      settings: {
        // optimizer: {
        //   enabled: true,
        //   runs: 200
        // },
        // evmVersion: 'istanbul',
        // viaIR: true,
      }
    }
  }
};

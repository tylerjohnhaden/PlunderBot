// https://github.com/trufflesuite/truffle-hdwallet-provider
var HDWalletProvider = require('truffle-hdwallet-provider');


// environment variables set in the package config
var networkId = process.env.npm_package_config_ganache_networkId;
var gasPrice = process.env.npm_package_config_ganache_gasPrice;
var gasLimit = process.env.npm_package_config_ganache_gasLimit;

// environment variables not set in the package config
var infuraKovanEndpoint = process.env.INFURA_KOVAN_ENDPOINT;
var mnemonic = process.env.MNEMONIC;

// naive environment assertions, since these aren't present by default
if (infuraKovanEndpoint === undefined) {
    throw new Error('truffle-config.js needs the environment variable "INFURA_KOVAN_ENDPOINT"');
} else if (mnemonic === undefined) {
    throw new Error('truffle-config.js needs the environment variable "MNEMONIC"');
} else if (mnemonic.split(' ').length != 12) {
    throw new Error('The environment variable "MNEMONIC" must be 12 words (space delineated)');
}


// https://truffleframework.com/docs/truffle/reference/configuration
var truffleConfig = {
  networks: {
    development: {
      host: '127.0.0.1',  // ganache defaults
      port: 8545,         // ganache defaults
      network_id: networkId,
      gas: gasLimit,
      gasPrice: gasPrice,
      // use the local ganache and the mnemonic to generate our main address
      //from: '0xb0c89d94ed0a571c9a89d835524afd83875f5441'
      from: (new HDWalletProvider(mnemonic, "http://127.0.0.1:8545")).getAddress(0)
    },
    kovan: {
      provider: () =>
        new HDWalletProvider(mnemonic, infuraKovanEndpoint),
      network_id: '42',
      gasLimit: 3000000
    }
  },
  solc: {
      optimizer: {
          enabled: true,
          runs: 1
      }
  }
};

console.info('\nSetting Truffle Configuration:\n', truffleConfig, '\n');
module.exports = truffleConfig;

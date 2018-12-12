// reference: https://truffleframework.com/docs/truffle/reference/configuration

var HDWalletProvider = require('truffle-hdwallet-provider');

var infura_kovan_endpoint = process.env.INFURA_KOVAN_ENDPOINT;
var mnemonic = process.env.MNEMONIC;

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '25624',
      gas: 6500000,
      gasPrice: 25000000000,
      gasLimit: 6500000,
      from: '0x8be4dd4aad3ea168c26a5df0accf511d359ef50e'
      // TODO: use (new HDWalletProvider(mnemonic, infura_kovan_endpoint)).getAddress(0);  // buggy though
    },
    kovan: {
      provider: () =>
        new HDWalletProvider(mnemonic, infura_kovan_endpoint),
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

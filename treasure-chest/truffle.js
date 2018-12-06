// reference: https://truffleframework.com/docs/truffle/reference/configuration

var HDWalletProvider = require("truffle-hdwallet-provider");

var infura_kovan_endpoint = "https://kovan.infura.io/v3/036a25e03d7b4dabbfef8b00ac39e956";
var mnemonic = "pirates may plunder gold but i plunder doubly fake internet gold arrrrrr";

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "25624",
      gas: 6500000,
      gasPrice: 25000000000,
      gasLimit: 6500000,
      from: "0x341ce5f1b95a4b96c3c6527285e810d2056ffeab"
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

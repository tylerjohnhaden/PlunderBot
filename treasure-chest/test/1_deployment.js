require('truffle-test-utils').init();

const TreasureChest = artifacts.require('TreasureChest');

const MAX_DEPLOYED_BYTECODE_SIZE = 24576;


contract('TreasureChest', (accounts) => {

    let treasureChest;

    // build up and tear down a new MyFirstContract before each test
    beforeEach(async () => {
        treasureChest = await TreasureChest.deployed();
    });

    it('has a validated contract size', async () => {
        // bytecode is in hexadecimal, where each byte is represented by two characters: 0x00 -> 0xff
        let bytecodeSize = treasureChest.constructor._json.bytecode.length / 2;
        let deployedBytecodeSize = treasureChest.constructor._json.deployedBytecode.length / 2;

        console.info('TreasureChest deployed at address: ' + web3.utils.toChecksumAddress(treasureChest.address))
        console.info(' -- size of bytecode in bytes = ', bytecodeSize);
        console.info(' -- size of deployed in bytes = ', deployedBytecodeSize);
        console.info(' -- initialisation and constructor code in bytes = ', bytecodeSize - deployedBytecodeSize);

        // Make assertion on deployed since the initial transaction takes constructor bytecode into account
        assert(deployedBytecodeSize <= MAX_DEPLOYED_BYTECODE_SIZE, 'Contract bytecode is too big to deploy!');
    });

});
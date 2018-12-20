// https://truffleframework.com/docs/truffle/testing/writing-tests-in-javascript

require('truffle-test-utils').init();

const TreasureChest = artifacts.require('TreasureChest');

function vmException(reason) {
    return 'VM Exception while processing transaction: revert ' + reason;
}

contract('TreasureChest', (accounts) => {

    let creator = accounts[0];
    let treasureChest;
    let treasureChestAddress;

    // build up and tear down a new TreasureChest before each test
    beforeEach(async () => {
        treasureChest = await TreasureChest.deployed();
        treasureChestAddress = await treasureChest.address;
    });

    it('is able to accept funds', async function () {
        assert.equal(web3.eth.getBalance(treasureChestAddress).toNumber(), 0);

        await treasureChest.sendTransaction({ value: 1e+18, from: creator });

        assert.equal(web3.eth.getBalance(treasureChestAddress).toNumber(), 1e+18);
    });

});
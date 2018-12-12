// https://truffleframework.com/docs/truffle/testing/writing-tests-in-javascript

require('truffle-test-utils').init();

const TreasureChest = artifacts.require('TreasureChest');

contract('TreasureChest', (accounts) => {

    let creator = accounts[0];
    let treasureChest;

    // build up and tear down a new TreasureChest before each test
    beforeEach(async () => {
        treasureChest = await TreasureChest.deployed();
    });


    it('has creator as a crew member by default', async () => {
        let thing = await treasureChest.crew(creator, { from: creator })
        assert(thing === true, 'The creator of the contract is not a crew member!');
    });

    // TODO: try to test creating the contract with address = 0x0



});
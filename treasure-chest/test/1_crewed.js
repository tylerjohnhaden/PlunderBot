// https://truffleframework.com/docs/truffle/testing/writing-tests-in-javascript

require('truffle-test-utils').init();

const TreasureChest = artifacts.require('TreasureChest');


contract('TreasureChest', (accounts) => {

    let creator = accounts[0];
    let secondAccount = accounts[1];
    let thirdAccount = accounts[2];
    let treasureChest;

    const zeroAddress = '0x0000000000000000000000000000000000000000';


    // build up and tear down a new TreasureChest before each test
    beforeEach(async () => {
        treasureChest = await TreasureChest.deployed();
    });


    it('has creator as a crew member by default', async () => {
        let creatorIsCrewMember = await treasureChest.crew(creator, { from: creator });
        assert.isTrue(creatorIsCrewMember, 'The creator of the contract is not a crew member!');
    });

    // TODO: try to test creating the contract with the zero address ?
    // TODO: test emitted events in constructor ?

    it('can add a crew member from another crew member', async () => {
        assert.isFalse(await treasureChest.crew(secondAccount, { from: creator }),
            'A non-creator address was crew by default!');

        let addingResult = await treasureChest.addCrewMember(secondAccount, { from: creator });

        assert.isTrue(await treasureChest.crew(secondAccount, { from: creator }),
            'An attempt to add another crew member failed!');

        assert.web3AllEvents(addingResult, [{
            event: 'Crewed_CrewAdded',
            args: {
                crewMember: secondAccount,
                operator: creator,
                0: secondAccount,
                1: creator,
                __length__: 2
            }
        }], 'The Crewed_CrewAdded event wasn\'t received!');
    });

    it('cannot add a crew member with the address 0x0', async () => {
        try {
            await treasureChest.addCrewMember(zeroAddress, { from: creator });

        } catch(err) {
            assert.equal(err.reason, 'Crewed.addCrewMember', 'Adding 0x0 to the crew threw the wrong revert message!');
            return;
        }

        assert.fail('Adding 0x0 to the crew did not revert!');
    });

    it('cannot add a crew member from a non crew member', async () => {
        try {
            await treasureChest.addCrewMember(secondAccount, { from: thirdAccount });

        } catch(err) {
            assert.equal(err.reason, 'Crewed.onlyCrew',
                'Adding crew from a non crew member threw the wrong revert message!');
            return;
        }

        assert.fail('Adding crew from a non crew member did not revert!');
    });

    it('can let a crew member be removed', async () => {
        if (!await treasureChest.crew(thirdAccount, { from: thirdAccount })) {
            await treasureChest.addCrewMember(thirdAccount, { from: creator });
        }

        assert.isTrue(await treasureChest.crew(thirdAccount, { from: thirdAccount }),
            'Un-able to add third account from creator');

        let removalResult = await treasureChest.removeCrewMember(thirdAccount, { from: creator });

        assert.isFalse(await treasureChest.crew(thirdAccount, { from: thirdAccount }),
            'Removing third account from crew was unsuccessful!');

        assert.web3AllEvents(removalResult, [{
            event: 'Crewed_CrewRemoved',
            args: {
                crewMember: thirdAccount,
                operator: creator,
                0: thirdAccount,
                1: creator,
                __length__: 2
            }
        }], 'The Crewed_CrewRemoved event wasn\'t received!');
    });

});

// https://truffleframework.com/docs/truffle/testing/writing-tests-in-javascript

require('truffle-test-utils').init();

const TreasureChest = artifacts.require('TreasureChest');

function vmException(reason) {
    return 'VM Exception while processing transaction: revert ' + reason;
}

contract('TreasureChest', (accounts) => {

    let creator = accounts[0];
    let secondAccount = accounts[1];
    let thirdAccount = accounts[2];
    let treasureChest;

    // build up and tear down a new TreasureChest before each test
    beforeEach(async () => {
        treasureChest = await TreasureChest.deployed();
    });


    it('has creator as a crew member by default', async () => {
        let creatorIsCrewMember = await treasureChest.crew(creator, { from: creator });
        assert(creatorIsCrewMember === true, 'The creator of the contract is not a crew member!');
    });

    // TODO: try to test creating the contract with address = 0x0 ?

    it('can add a crew member from another crew member', async () => {
        let secondAccountIsCrewMemberBefore = await treasureChest.crew(secondAccount, { from: creator });

        await treasureChest.addCrewMember(secondAccount, { from: creator });

        let secondAccountIsCrewMemberAfter = await treasureChest.crew(secondAccount, { from: creator });

        assert(secondAccountIsCrewMemberBefore === false, 'A non-creator address was crew by default!');
        assert(secondAccountIsCrewMemberAfter === true, 'An attempt to add another crew member failed!');
    });

    it('cannot add a crew member with the address 0x0', async () => {
        try {
            console.info(await treasureChest.crew(creator, { from: creator }));
            console.info(await treasureChest.crew('0xb0c89d94ed0a571c9a89d835524afd83875f5441', { from: '0xb0c89d94ed0a571c9a89d835524afd83875f5441' }));
            console.info(accounts);
            await treasureChest.addCrewMember('0x0', { from: creator });

        } catch(err) {
            console.log(err.message);
            assert(err.message === vmException('Crewed.addCrewMember'),
                'Adding 0x0 to the crew threw the wrong revert message!');

            return;
        }

        assert(false, 'Adding 0x0 to the crew did not revert!');
    });

    it('cannot add a crew member from a non crew member', async () => {
        try {
            await treasureChest.addCrewMember(secondAccount, { from: thirdAccount });

        } catch(err) {
            console.log(err.message);
            assert(err.message === vmException('Crewed.onlyCrew'),
                'Adding crew from a non crew member threw the wrong revert message!');

            return;
        }

        assert(false, 'Adding crew from a non crew member did not revert!');
    });

    it('can let a crew member be removed', async () => {
        if (false === await treasureChest.crew(thirdAccount, { from: thirdAccount })) {
            await treasureChest.addCrewMember(thirdAccount, { from: creator });
        }

        assert(true === await treasureChest.crew(thirdAccount, { from: thirdAccount }),
            'Un-able to add third account from creator');

        await treasureChest.removeCrewMember(thirdAccount, { from: creator });

        assert(false === await treasureChest.crew(thirdAccount, { from: thirdAccount }),
            'Removing third account from crew was unsuccessful!');
    });

});
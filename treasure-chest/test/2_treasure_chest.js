// https://truffleframework.com/docs/truffle/testing/writing-tests-in-javascript
// https://web3js.readthedocs.io/en/1.0/web3-eth.html
// https://www.npmjs.com/package/truffle-test-utils

require('truffle-test-utils').init();

const TreasureChest = artifacts.require('TreasureChest');

contract('TreasureChest', (accounts) => {

    let creator = accounts[0];
    let secondAddress = accounts[1];
    let thirdAddress = accounts[2];
    let treasureChest;
    let treasureChestAddress;

    const zeroAddress = '0x0000000000000000000000000000000000000000';
    const defaultMin = 1000;
    const defaultMax = 2000;

    // build up and tear down a new TreasureChest before each test
    beforeEach(async () => {
        treasureChest = await TreasureChest.deployed();
        treasureChestAddress = await treasureChest.address;
    });

    // TODO: test emitted events in constructor ?

    it('is able to accept funds', async () => {
        let value = 1e+5;

        assert.equal(Number(await web3.eth.getBalance(treasureChestAddress)), 0,
            'The contract started with non-zero balance ...');

        let sendResult = await treasureChest.sendTransaction({ value: value, from: creator });

        assert.equal(Number(await web3.eth.getBalance(treasureChestAddress)), value,
            'After sending eth to the contract, the balance was not the expected amount!');

        assert.web3AllEvents(sendResult, [{
            event: 'TreasureChest_PaymentReceived',
            args: {
                payerAddress: creator,
                amount: value,
                currentBalance: value,
                0: creator,
                1: value,
                2: value,
                __length__: 3
            }
        }], 'The TreasureChest_PaymentReceive event wasn\'t received!');

    });

    it('has no drains be default', async () => {
        assert.equal(0, await treasureChest.drainPointerHead({ from: creator }),
            'TreasureChest has a drain by default!');
    });

    async function validateDrainState(drainAddress, index, min, max) {
        assert.isTrue(await treasureChest.isADrain(drainAddress, { from: creator }),
            'The address ' + drainAddress + ' is not a drain!');

        assert.equal(drainAddress, await treasureChest.drainPointers(index, { from: creator }),
            'The drain ' + drainAddress + ' is not at the pointer specified!');

        assert.equal(0, await treasureChest.getIndexByAddress(drainAddress, { from: creator }),
            'The drain ' + drainAddress + ' does not have a matching index!');

        assert.equal(min, await treasureChest.getMinByAddress(drainAddress, { from: creator }),
            'The drain ' + drainAddress + ' does not have a matching min!');

        assert.equal(max, await treasureChest.getMaxByAddress(drainAddress, { from: creator }),
            'The drain ' + drainAddress + ' does not have a matching max!');
    }

    it('add a valid drain', async () => {
        assert.equal(0, await treasureChest.drainPointerHead({ from: creator }),
            'TreasureChest has a drain by default! *while adding a drain*');
        assert.isFalse(await treasureChest.isADrain(secondAddress, { from: creator }),
            'SecondAddress is a drain even though there are zero drains!');

        let addResult = await treasureChest.addDrain(secondAddress, defaultMin, defaultMax, { from: creator });

        assert.equal(1, await treasureChest.drainPointerHead({ from: creator }),
            'TreasureChest addDrain did not increase the number of drains to one!');

        await validateDrainState(secondAddress, 0, defaultMin, defaultMax);

        assert.web3AllEvents(addResult, [{
            event: 'TreasureChest_DrainAdded',
            args: {
                drainAddress: secondAddress,
                min: defaultMin,
                max: defaultMax,
                0: secondAddress,
                1: defaultMin,
                2: defaultMax,
                __length__: 3
            }
        }], 'The TreasureChest_DrainAdded event wasn\'t received!');
    });

    it('won\'t accept the zero address as a drain', async () => {
        try {
            await treasureChest.addDrain(zeroAddress, defaultMin, defaultMax, { from: creator });

        } catch(err) {
            assert.equal(err.reason, 'TreasureChest.addDrain.0',
                'Adding the zero address as a drain threw the wrong revert message!');
            return;
        }

        assert.fail('Adding the zero address as a drain did not revert!');
    });

    it('won\'t add a drain for a second time', async () => {
        if (!await treasureChest.isADrain(secondAddress, { from: creator })) {
            await treasureChest.addDrain(secondAddress, defaultMin, defaultMax, { from: creator });
        }

        try {
            await treasureChest.addDrain(secondAddress, defaultMin, defaultMax, { from: creator });

        } catch(err) {
            assert.equal(err.reason, 'TreasureChest.addDrain.1',
                'Adding the zero address as a drain threw the wrong revert message!');
            return;
        }

        assert.fail('Adding the zero address as a drain did not revert!');
    });

    it('won\'t add a drain with zero max', async () => {
        assert.isFalse(await treasureChest.isADrain(thirdAddress, { from: creator }),
            'thirdAddress must not be a drain to run this test');

        try {
            await treasureChest.addDrain(thirdAddress, 0, 0, { from: creator });

        } catch(err) {
            assert.equal(err.reason, 'TreasureChest.addDrain.2',
                'Adding a drain with zero max threw the wrong revert message!');
            return;
        }

        assert.fail('Adding a drain with zero max did not revert!');
    });

    it('won\'t add a drain with min more than max', async () => {
        assert.isFalse(await treasureChest.isADrain(thirdAddress, { from: creator }),
            'thirdAddress must not be a drain to run this test');

        try {
            await treasureChest.addDrain(thirdAddress, defaultMax, defaultMin, { from: creator });

        } catch(err) {
            assert.equal(err.reason, 'TreasureChest.addDrain.3',
                'Adding a drain with min more than max threw the wrong revert message!');
            return;
        }

        assert.fail('Adding a drain with min more than max did not revert!');
    });

});
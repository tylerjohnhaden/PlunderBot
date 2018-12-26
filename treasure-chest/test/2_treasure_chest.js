// https://truffleframework.com/docs/truffle/testing/writing-tests-in-javascript
// https://web3js.readthedocs.io/en/1.0/web3-eth.html
// https://www.npmjs.com/package/truffle-test-utils

require('truffle-test-utils').init();
// https://web3js.readthedocs.io/en/1.0/web3-utils.html#bn
const BN = web3.utils.BN;

const TreasureChest = artifacts.require('TreasureChest');

contract('TreasureChest', (accounts) => {

    let creator = accounts[0];
    let secondAddress = accounts[1];
    let thirdAddress = accounts[2];
    let treasureChest;
    let treasureChestAddress;

    const zeroAddress = '0x0000000000000000000000000000000000000000';
    const defaultMin = new BN(1e+5);
    const defaultMax = new BN(2e+5);
    const updateMin = new BN(5e+4);
    const updateMax = new BN(3e+5);
    const defaultStartingBalance = new BN('100000000000000000000');

    // build up and tear down a new TreasureChest before each test
    beforeEach(async () => {
        treasureChest = await TreasureChest.deployed();
        treasureChestAddress = await treasureChest.address;
    });

    // TODO: test emitted events in constructor ?

    it('is able to accept funds', async () => {
        assert.equal(Number(await web3.eth.getBalance(treasureChestAddress)), 0,
            'The contract started with non-zero balance ...');

        let sendResult = await treasureChest.sendTransaction({ value: defaultMin, from: creator });

        assert.equal(Number(await web3.eth.getBalance(treasureChestAddress)), defaultMin,
            'After sending eth to the contract, the balance was not the expected amount!');

        assert.web3AllEvents(sendResult, [{
            event: 'TreasureChest_PaymentReceived',
            args: {
                payerAddress: creator,
                amount: Number(defaultMin),
                currentBalance: Number(defaultMin),
                0: creator,
                1: Number(defaultMin),
                2: Number(defaultMin),
                __length__: 3
            }
        }], 'The correct TreasureChest_PaymentReceive event wasn\'t received!');

    });

    it('has no drains be default', async () => {
        assert.equal(0, await treasureChest.drainPointerHead({ from: creator }),
            'TreasureChest has a drain by default!');
    });

    // drain state validation helper function
    async function validateDrainState(drainAddress, index, min, max) {
        assert.isTrue(await treasureChest.isADrain(drainAddress, { from: creator }),
            'The address ' + drainAddress + ' is not a drain!');

        assert.equal(drainAddress, await treasureChest.drainPointers(index, { from: creator }),
            'The drain ' + drainAddress + ' is not at the pointer specified!');

        assert.equal(index, await treasureChest.getIndexByAddress(drainAddress, { from: creator }),
            'The drain ' + drainAddress + ' does not have a matching index!');

        assert(min.eq(new BN(await treasureChest.getMinByAddress(drainAddress, { from: creator }))),
            'The drain ' + drainAddress + ' does not have a matching min!');

        assert(max.eq(new BN(await treasureChest.getMaxByAddress(drainAddress, { from: creator }))),
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
                min: Number(defaultMin),
                max: Number(defaultMax),
                0: secondAddress,
                1: Number(defaultMin),
                2: Number(defaultMax),
                __length__: 3
            }
        }], 'The correct TreasureChest_DrainAdded event wasn\'t received!');
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

    it('will update a valid drain', async () => {
        await validateDrainState(secondAddress, 0, defaultMin, defaultMax);

        let updateResult = await treasureChest.updateDrainMin(secondAddress, updateMin, { from: creator });

        await validateDrainState(secondAddress, 0, updateMin, defaultMax);

        assert.web3AllEvents(updateResult, [{
            event: 'TreasureChest_DrainUpdated',
            args: {
                drainAddress: secondAddress,
                min: Number(updateMin),
                max: Number(defaultMax),
                0: secondAddress,
                1: Number(updateMin),
                2: Number(defaultMax),
                __length__: 3
            }
        }], 'The correct TreasureChest_DrainUpdated (min) event wasn\'t received!');

        updateResult = await treasureChest.updateDrainMax(secondAddress, updateMax, { from: creator });

        await validateDrainState(secondAddress, 0, updateMin, updateMax);

        assert.web3AllEvents(updateResult, [{
            event: 'TreasureChest_DrainUpdated',
            args: {
                drainAddress: secondAddress,
                min: Number(updateMin),
                max: Number(updateMax),
                0: secondAddress,
                1: Number(updateMin),
                2: Number(updateMax),
                __length__: 3
            }
        }], 'The correct TreasureChest_DrainUpdated (max) event wasn\'t received!');
    });

    // TODO: "updateDrain" sad path tests

    it('will remove a valid drain', async () => {
        await validateDrainState(secondAddress, 0, updateMin, updateMax);

        let removeResult = await treasureChest.removeDrain(secondAddress, { from: creator });

        assert.equal(zeroAddress, await treasureChest.drainPointers(0, { from: creator }),
            'A removed drain is still present in drainPointers!');

        assert.isFalse(await treasureChest.isADrain(secondAddress, { from: creator }),
            'A removed drain has a non zero max!');

        assert.web3AllEvents(removeResult, [{
            event: 'TreasureChest_DrainRemoved',
            args: {
                drainAddress: secondAddress,
                0: secondAddress,
                __length__: 1
            }
        }], 'The correct TreasureChest_DrainRemoved event wasn\'t received!');
    });

    // TODO: "removeDrain" sad path tests

    it('sends funds to a valid drain', async () => {
        assert.isFalse(await treasureChest.isADrain(thirdAddress, { from: creator }),
            'thirdAddress must not be a drain to run this test');

        assert(defaultStartingBalance.eq(new BN(await web3.eth.getBalance(thirdAddress))),
            'thirdAddress should have the default starting balance for this test');

        await treasureChest.sendTransaction({ value: defaultMax, from: creator });
        let treasureChestBalanceBefore = new BN(await web3.eth.getBalance(treasureChestAddress));

        assert(treasureChestBalanceBefore.gte(defaultMax),
            'treasureChest should have the required balance for this test');

        let drainMin = defaultStartingBalance.add(defaultMin);
        let drainMax = defaultStartingBalance.add(defaultMax);

        await treasureChest.addDrain(
            thirdAddress,
            drainMin,
            drainMax,
            { from: creator }
        );
        let thirdAddressIndex = Number(await treasureChest.getIndexByAddress(thirdAddress, { from: creator }));
        await validateDrainState(
            thirdAddress,
            thirdAddressIndex,
            drainMin,
            drainMax
        );

        let sendResult = await treasureChest.send(thirdAddress, { from: creator });

        assert.equal(drainMax, await web3.eth.getBalance(thirdAddress),
            'Sending fund to thirdAddress did not increase it\'s balance to it\'s max');

        let expectedTreasureChestBalanceAfter = treasureChestBalanceBefore.sub(defaultMax)

        assert(
            expectedTreasureChestBalanceAfter.eq(new BN(await web3.eth.getBalance(treasureChestAddress))),
            'Sending funds result in the wrong amount of funds being taken out of TreasureChest'
        );

        assert.web3AllEvents(sendResult, [{
            event: 'TreasureChest_PaymentSent',
            args: {
                drainAddress: thirdAddress,
                amount: Number(defaultMax),
                currentBalance: Number(expectedTreasureChestBalanceAfter),
                0: thirdAddress,
                1: Number(defaultMax),
                2: Number(expectedTreasureChestBalanceAfter),
                __length__: 3
            }
        }], 'The correct TreasureChest_PaymentSent event wasn\'t received!');
    });

    // TODO: "send" sad path tests
    // TODO: does it make sense to test the view functions?

});
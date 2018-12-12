pragma solidity ^0.4.24;

// Solidity 0.5.1 reference documentation --- https://solidity.readthedocs.io/en/v0.5.1/

/**# A YAML specification for all the explicit revert messages in Crewed and TreasureChest

Revert:
    Crewed:
        constructor: "We don't allow 0x0 to be a crew member, or contract creator"
        onlyCrew: "You must be in the crew to call this"
        addCrewMember: "We don't allow 0x0 to be a crew member"
    TreasureChest:
        addDrain:
            0: "We don't allow 0x0 to be a drain address"
            1: "We don't allow an 'active' drain to be added again"
            2: "The given max must be non-zero"
            3: "The given min must be less than or equal to the given max"
        updateDrainMin:
            0: "The specified drain must be 'active'"
            1: "The given min must be less than or equal to the current max"
        updateDrainMax:
            0: "The specified drain must be 'active'"
            1: "The given max must be non-zero"
            2: "The given max must be greater than or equal to the current min"
        removeDrain: "You can't remove a 'non active' drain"
*/

contract Crewed {

    /// crew: bit mapping for authorized operator addresses for this contract
    mapping(address => bool) public crew;

    constructor() public {
        // We don't allow 0x0 to be a crew member, or contract creator.
        require(msg.sender != 0x0, "Crewed.constructor");

        // Set the contract's creator as a crew member, we need at least one
        crew[msg.sender] = true;
    }

    // This contract will be used to send in money from Kovan test faucets.
    // These faucets simply transfer (Kovan) ETH as if this was a user's address.
    function () public payable {}

    /**
     *    If the crew mapping returns false, make them walk the plank.
     *
     *    In the line below, msg.sender is the address that called the
     *    original function.
     *
     *       "The values of all members of msg, including
     *        msg.sender and msg.value can change for every
     *        external function call. This includes calls to
     *        library functions."
     *
     *   https://solidity.readthedocs.io/en/v0.5.1/units-and-global-variables.html#special-variables-and-functions
     */
    modifier onlyCrew() {
        // You must be in the crew to call this.
        require(crew[msg.sender], "Crewed.onlyCrew");
        _;
    }

    function addCrewMember(address crewMember) public onlyCrew {
        // We don't allow 0x0 to be a crew member.
        require(crewMember != 0x0, "Crewed.addCrewMember");

        // Set to true to be welcomed into the crew
        crew[crewMember] = true;
    }

    function removeCrewMember(address crewMember) public onlyCrew {
        // Doesn't matter if crewMember is already false, just set anyway
        // If you're spending money on removing non crew members, oh well
        crew[crewMember] = false;
    }
}

contract TreasureChest is Crewed {

    /**
     *    Drain will be created 'once' per address. Technically, if a drain is added,
     *    removed, then added again, a new Drain will be 'created' but in the exact same
     *    spot as the previous one.
     *
     *    The size of these values could be smaller. However min and max in units
     *    of (Kovan) Eth Wei best suits its use as thresholds for account balances.
     *    Nothing about this contract requires Wei units. Since min and max are uint256,
     *    making index smaller has no gas saving due to fixed size word packing.
     */
    struct Drain {
        uint256 index;
        uint256 min;
        uint256 max;
    }

    mapping(address => Drain) public drains;
    mapping(uint256 => address) public drainPointers;
    uint256 public drainPointerHead;

    /// The constructor is default and can be omitted

    function addDrain(address drainAddress, uint256 _min, uint256 _max) public onlyCrew {
        // We wont allow 0x0 to be a drain address
        require(drainAddress != 0x0, "TreasureChest.addDrain.0");
        // We wont allow an 'active' drain to be added again. It will overwrite the
        // existing struct, but drain pointers will become littered.
        require(drains[drainAddress].max == 0, "TreasureChest.addDrain.1");
        // If a drain's max is 0, we'll never end up doing anything, so ignore it
        require(_max != 0, "TreasureChest.addDrain.2");
        // If a drain's min is greater than its max, our math will screw up
        require(_min <= _max, "TreasureChest.addDrain.3");

        // Add the new drainAddress to the head of the drain pointer 'list'
        drainPointers[drainPointerHead] = drainAddress;
        // Record the current index, min, and max
        drains[drainAddress] = Drain(drainPointerHead, _min, _max);
        // Increment the pointer head for the next added drain
        drainPointerHead += 1;
    }

    function updateDrainMin(address drainAddress, uint256 _min) public onlyCrew {
        // We never allow an 'active' drain to have max == 0, and can use that as proof it is one
        require(drains[drainAddress].max != 0, "TreasureChest.updateDrainMin.0");
        // If a drain's min is greater than its max, our math will screw up
        require(_min <= drains[drainAddress].max, "TreasureChest.updateDrainMin.1");

        // Update min
        drains[drainAddress].min = _min;
    }

    function updateDrainMax(address drainAddress, uint256 _max) public onlyCrew {
        // We never allow an 'active' drain to have max == 0, and can use that as proof it is one
        require(drains[drainAddress].max != 0, "TreasureChest.updateDrainMax.0");
        // If a drain's max is 0, we'll never end up doing anything, so ignore it
        require(_max != 0, "TreasureChest.updateDrainMax.1");
        // If a drain's min is greater than its max, our math will screw up
        require(drains[drainAddress].min <= _max, "TreasureChest.updateDrainMax.2");

        // Update max
        drains[drainAddress].max = _max;
    }

    /**
     *    There is no point in setting Drain.min or Drain.index to 0. View calls to
     *    drainPointers will skip it, and the history of transactions will always
     *    reveal past drains. If we try updating, Drain.max will not let it pass.
     *    If we want to add a new one, it will simply be over written anyway.
     */
    function removeDrain(address drainAddress) public onlyCrew {
        // We never allow an 'active' drain to have max == 0, and can use that as proof it is one
        require(drains[drainAddress].max != 0, "TreasureChest.removeDrain");

        // Since we don't allow drain addresses to be 0x0, we can nullify the
        // drain pointer. We rely on the number of drains to be relatively
        // low, so calls to view drainPointers is cheap.
        drainPointers[drains[drainAddress].index] = 0x0;
        // Must zero out max, as this is what we use to check drain status
        drains[drainAddress].max = 0;
    }
}

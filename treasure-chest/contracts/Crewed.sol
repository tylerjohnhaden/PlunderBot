pragma solidity ^0.5.0;

/**# A YAML specification for all the explicit revert messages in Crewed

Revert:
    Crewed:
        constructor: "We don't allow 0x0 to be a crew member, or contract creator"
        onlyCrew: "You must be in the crew to call this"
        addCrewMember: "We don't allow 0x0 to be a crew member"
*/

contract Crewed {

    event Crewed_CrewAdded(address crewMember, address operator);
    event Crewed_CrewRemoved(address crewMember, address operator);

    /// crew: bit mapping for authorized operator addresses for this contract
    mapping(address => bool) public crew;

    constructor() internal {
        // We don't allow 0x0 to be a crew member, or contract creator.
        require(msg.sender != address(0x0), "Crewed.constructor");

        // Set the contract's creator as a crew member, we need at least one
        crew[msg.sender] = true;

        emit Crewed_CrewAdded(msg.sender, msg.sender);
    }

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
     *   https://solidity.readthedocs.io/en/v0.5.0/units-and-global-variables.html#special-variables-and-functions
     */
    modifier onlyCrew() {
        // You must be in the crew to call this.
        require(crew[msg.sender], "Crewed.onlyCrew");
        _;
    }

    function addCrewMember(address crewMember) public onlyCrew {
        // We don't allow 0x0 to be a crew member.
        require(crewMember != address(0x0), "Crewed.addCrewMember");

        // Set to true to be welcomed into the crew
        crew[crewMember] = true;

        emit Crewed_CrewAdded(crewMember, msg.sender);
    }

    function removeCrewMember(address crewMember) public onlyCrew {
        // Doesn't matter if crewMember is already false, just set anyway
        // If you're spending money on removing non crew members, oh well
        crew[crewMember] = false;

        emit Crewed_CrewRemoved(crewMember, msg.sender);
    }
}
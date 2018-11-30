pragma solidity ^0.4.0;

contract TreasureChest {

    mapping(address => bool) crew;

    constructor() public {
        crew[msg.sender] = true;
    }

    modifier onlyCrew() {
        require(crew[msg.sender], "You aren't in the crew");
        _;
    }

    function addCrewMember(address _crewMember) public onlyCrew {
        crew[_crewMember] = true;
    }

    function removeCrewMember(address _crewMember) public onlyCrew {
        crew[_crewMember] = false;
    }

    function deposit() public payable {}

    function withdraw(uint256 amount) public onlyCrew {
        msg.sender.transfer(amount);
    }

    function () public payable {}
}

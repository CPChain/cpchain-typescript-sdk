pragma solidity ^0.4.24;

contract Example {
    event ModifyName(string name, uint256 blockNumber);
    string name;
    address owner;

    constructor() public {
        name = "world";
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    function greet() public view returns (string) {
        return string(abi.encodePacked("Hello, ", name));
    }

    function modify(string newName) public payable {
        name = newName;
        emit ModifyName(name, block.number);
    }

    function collectBack() onlyOwner public {
        msg.sender.transfer(address(this).balance);
    }
}

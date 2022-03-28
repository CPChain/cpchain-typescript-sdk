pragma solidity ^0.4.24;

contract Example {
    event ModifyName(string name, uint256 blockNumber);
    string name;

    constructor() public {
        name = "world";
    }

    function greet() public view returns (string) {
        return string(abi.encodePacked("Hello, ", name));
    }

    function modify(string newName) public payable {
        name = newName;
        emit ModifyName(name, block.number);
    }
}

pragma experimental ABIEncoderV2;
pragma solidity ^0.4.25;

contract Example {
    string name;
    address owner;

    struct A {
      string a;
    }

    event ModifyName(string name, uint256 blockNumber, A a);

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
        A memory a = A("1");
        emit ModifyName(name, block.number, a);
    }

    function collectBack() onlyOwner public {
        msg.sender.transfer(address(this).balance);
    }
}

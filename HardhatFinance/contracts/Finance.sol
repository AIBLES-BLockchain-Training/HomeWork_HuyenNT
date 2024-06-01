// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract UserManager {
    enum Role { USER, ADMIN, USER_MANAGER }

    address public admin;
    mapping(address => Role) public userRoles;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Caller is not the admin");
        _;
    }

    constructor() {
        admin = msg.sender;
        userRoles[admin] = Role.ADMIN;
    }

    function addUser(address _user, Role _role) public onlyAdmin {
        userRoles[_user] = _role;
    }

    function getUserRole(address _user) public view returns (Role) {
        return userRoles[_user];
    }
}

contract FinancialContract is UserManager {
    mapping(address => uint256) public balances;

    modifier onlyUser() {
        require(getUserRole(msg.sender) == Role.USER, "Only users can call this function");
        _;
    }

    function deposit(uint256 _amount) external onlyUser {
        require(_amount > 0, "Invalid deposit amount");
        balances[msg.sender] += _amount;
    }

    function withdraw(uint256 _amount) external onlyUser {
        require(_amount > 0, "Invalid withdrawal amount");
        require(balances[msg.sender] >= _amount, "Insufficient balance");
        balances[msg.sender] -= _amount;
    }
}
contract LoanManagerContract is FinancialContract {
    struct LoanRequest {
        uint256 amount;
        bool isApproved;
    }

    mapping(address => LoanRequest) public loanRequests;

    modifier onlyManager() {
        require(getUserRole(msg.sender) == Role.USER_MANAGER || msg.sender == admin, "Only the manager can call this function");
        _;
    }


    modifier onlyUserWithActiveLoan() {
        require(loanRequests[msg.sender].isApproved, "No active loan for the user");
        _;
    }

    constructor() UserManager() {}

    function initiateLoanRequest(uint256 _amount) external onlyUser {
        require(_amount > 0, "Invalid loan amount");
        require(!loanRequests[msg.sender].isApproved, "There is an active loan for the user");

        loanRequests[msg.sender] = LoanRequest(_amount, false);
    }

    function approveLoanRequest(address _user) external onlyManager {
        LoanRequest storage request = loanRequests[_user];
        require(request.amount > 0 && !request.isApproved, "Invalid loan request");
        request.isApproved = true;
        balances[_user] += request.amount;
    }

    function repayLoan(uint256 _amount) external onlyUserWithActiveLoan {
        require(balances[msg.sender] >= _amount, "Insufficient balance for repayment");

        balances[msg.sender] -= _amount;

    }
}


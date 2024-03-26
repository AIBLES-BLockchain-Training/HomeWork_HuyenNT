// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
contract UserManager {
    address public admin;
    mapping(address => string) public userRoles;
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function addUser(address _user, string memory _role) external onlyAdmin {
        userRoles[_user] = _role;
    }

    function getUserRole(address _user) external view returns (string memory) {
        return userRoles[_user];
    }
}
contract FinancialContract is UserManager {
    address public user;
    mapping(address => uint256) public balances;

    modifier onlyUser() {
        require(msg.sender == user, "Only users can call this function");
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
    address public manager;

    mapping(address => LoanRequest) public loanRequests;

    struct LoanRequest {
        uint256 amount;
        bool isApproved;
    }

    event LoanRequestInitiated(address indexed user, uint256 amount);
    event LoanRequestApproved(address indexed manager, address indexed user, uint256 amount);
    event LoanRepaid(address indexed user, uint256 amount);

    modifier onlyManager() {
        require(msg.sender == manager, "Only the manager can call this function");
        _;
    }

    modifier onlyUserWithActiveLoan() {
        require(loanRequests[msg.sender].isApproved, "No active loan for the user");
        _;
    }

    constructor() {
        manager = msg.sender;
    }

    function initiateLoanRequest(uint256 _amount) external onlyUser {
        require(_amount > 0, "Invalid loan amount");
        require(!loanRequests[msg.sender].isApproved, "There is an active loan for the user");

        loanRequests[msg.sender] = LoanRequest(_amount, false);
        emit LoanRequestInitiated(msg.sender, _amount);
    }

    function approveLoanRequest(address _user) external onlyManager {
        LoanRequest storage request = loanRequests[_user];
        require(request.amount > 0 && !request.isApproved, "Invalid loan request");
        request.isApproved = true;
        balances[_user] += request.amount;

        emit LoanRequestApproved(msg.sender, _user, request.amount);
    }

    function repayLoan(uint256 _amount) external onlyUserWithActiveLoan {
        require(balances[msg.sender] >= _amount, "Insufficient balance for repayment");

        balances[msg.sender] -= _amount;

        emit LoanRepaid(msg.sender, _amount);
    }
}
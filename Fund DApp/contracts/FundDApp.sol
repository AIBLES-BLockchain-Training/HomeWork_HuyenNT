// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FundDApp {
    struct User {
        uint256 id;
        string username;
        address walletAddress;
        uint256 balance;
    }

    struct Transaction {
        uint256 id;
        uint256 date;
        uint256 amount;
        TransactionType transactionType;
        uint256 userId;
    }

    struct Vote {
        uint256 id;
        string description;
        uint256 createDate;
        string category;
        uint256 amount;
        uint256 userId;
    }

    struct Notification {
        uint256 id;
        string message;
        uint256 userId;
    }

    enum TransactionType {
        DEPOSIT,
        WITHDRAW
    }

    mapping(uint256 => User) private users;
    mapping(uint256 => Transaction) private transactions;
    mapping(uint256 => Vote) private votes;
    mapping(uint256 => Notification) private notifications;

    uint256 private userCounter;
    uint256 private transactionCounter;
    uint256 private voteCounter;
    uint256 private notificationCounter;

    event UserCreated(uint256 id, string username, address walletAddress);
    event WalletAddressUpdated(uint256 id, address walletAddress);
    event TransactionCreated(
        uint256 id,
        uint256 date,
        uint256 amount,
        TransactionType transactionType,
        uint256 userId
    );
    event VoteCreated(
        uint256 id,
        string description,
        uint256 createDate,
        string category,
        uint256 amount,
        uint256 userId
    );
    event NotificationCreated(uint256 id, string message, uint256 userId);
    event MemberRemoved(uint256 userId);
    event Withdraw(uint256 userId, uint256 amount);

    function createUser(
        string memory _username,
        address _walletAddress
    ) public {
        userCounter++;
        users[userCounter] = User(userCounter, _username, _walletAddress, 0);
        emit UserCreated(userCounter, _username, _walletAddress);
    }
    function updateWalletAddress(
        uint256 _userId,
        address _walletAddress
    ) public {
        require(users[_userId].id != 0, "User does not exist");
        users[_userId].walletAddress = _walletAddress;
        emit WalletAddressUpdated(_userId, _walletAddress);
    }

    function getUser(uint256 _userId) public view returns (User memory) {
        User memory user = users[_userId];
        return user;
    }

    function checkBalance(uint256 _userId) public view returns (uint256) {
        return users[_userId].balance;
    }

    function createTransaction(
        uint256 _date,
        uint256 _amount,
        TransactionType _transactionType,
        uint256 _userId
    ) public {
        require(users[_userId].id != 0, "User does not exist");
        transactionCounter++;
        transactions[transactionCounter] = Transaction(
            transactionCounter,
            _date,
            _amount,
            _transactionType,
            _userId
        );
        emit TransactionCreated(
            transactionCounter,
            _date,
            _amount,
            _transactionType,
            _userId
        );

        if (_transactionType == TransactionType.DEPOSIT) {
            users[_userId].balance += _amount;
        } else if (_transactionType == TransactionType.WITHDRAW) {
            require(users[_userId].balance >= _amount, "Insufficient balance");
            users[_userId].balance -= _amount;
        }
    }

    function getTransaction(
        uint256 _transactionId
    )
        public
        view
        returns (uint256, uint256, uint256, TransactionType, uint256)
    {
        Transaction memory transaction = transactions[_transactionId];
        return (
            transaction.id,
            transaction.date,
            transaction.amount,
            transaction.transactionType,
            transaction.userId
        );
    }

    function createVote(
        string memory _description,
        uint256 _createDate,
        string memory _category,
        uint256 _amount,
        uint256 _userId
    ) public {
        require(users[_userId].id != 0, "User does not exist");
        voteCounter++;
        votes[voteCounter] = Vote(
            voteCounter,
            _description,
            _createDate,
            _category,
            _amount,
            _userId
        );
        emit VoteCreated(
            voteCounter,
            _description,
            _createDate,
            _category,
            _amount,
            _userId
        );
    }

    function getVote(
        uint256 _voteId
    )
        public
        view
        returns (
            uint256,
            string memory,
            uint256,
            string memory,
            uint256,
            uint256
        )
    {
        Vote memory vote = votes[_voteId];
        return (
            vote.id,
            vote.description,
            vote.createDate,
            vote.category,
            vote.amount,
            vote.userId
        );
    }

    
    function voteRemoveMember(uint256 _userId) public {
        require(users[_userId].id != 0, "User does not exist");
        delete users[_userId];
        emit MemberRemoved(_userId);
    }

    function voteWithdraw(uint256 _userId, uint256 _amount) public {
        require(users[_userId].id != 0, "User does not exist");
        require(users[_userId].balance >= _amount, "Insufficient balance");
        users[_userId].balance -= _amount;
        emit Withdraw(_userId, _amount);
    }


    function createNotification(
        string memory _message,
        uint256 _userId
    ) public {
        require(users[_userId].id != 0, "User does not exist");
        notificationCounter++;
        notifications[notificationCounter] = Notification(
            notificationCounter,
            _message,
            _userId
        );
        emit NotificationCreated(notificationCounter, _message, _userId);
    }

    function getNotification(
        uint256 _notificationId
    ) public view returns (uint256, string memory, uint256) {
        Notification memory notification = notifications[_notificationId];
        return (notification.id, notification.message, notification.userId);
    }
}

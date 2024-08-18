const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("FundDApp", function () {
  async function deployFundDAppFixture() {
    const FundDApp = await ethers.getContractFactory("FundDApp");
    const [addr1, addr2] = await ethers.getSigners();

    const fundDApp = await FundDApp.deploy();
    await fundDApp.waitForDeployment();

    return { fundDApp, addr1, addr2 };
  }

  describe("User management", function () {
    it("Should create a user", async function () {
      const { fundDApp, addr1 } = await loadFixture(deployFundDAppFixture);
      await fundDApp.createUser("Bao", addr1.address);
      const user = await fundDApp.getUser(1);
      expect(user.username).to.equal("Bao");
      expect(user.walletAddress).to.equal(addr1.address);
    });

    it("Should update wallet address", async function () {
      const { fundDApp, addr1, addr2 } = await loadFixture(
        deployFundDAppFixture
      );
      await fundDApp.createUser("Bao", addr1.address);
      await fundDApp.updateWalletAddress(1, addr2.address);
      const user = await fundDApp.getUser(1);
      expect(user.walletAddress).to.equal(addr2.address);
    });

    it("Should revert updateWalletAddress if user does not exist", async function () {
      const { fundDApp, addr2 } = await loadFixture(deployFundDAppFixture);
      await expect(fundDApp.updateWalletAddress(999, addr2.address)).to.be.revertedWith("User does not exist");
    });
  });

  describe("Balance management", function () {
    it("Should return correct balance after deposit", async function () {
      const { fundDApp, addr1 } = await loadFixture(deployFundDAppFixture);
      await fundDApp.createUser("Bao", addr1.address);
      await fundDApp.createTransaction(Date.now(), 100, 0, 1); // 0 = DEPOSIT
      const balance = await fundDApp.checkBalance(1);
      expect(balance).to.equal(100);
    });

    it("Should return correct balance after withdrawal", async function () {
      const { fundDApp, addr1 } = await loadFixture(deployFundDAppFixture);
      await fundDApp.createUser("Bao", addr1.address);
      await fundDApp.createTransaction(Date.now(), 100, 0, 1); // 0 = DEPOSIT
      await fundDApp.createTransaction(Date.now(), 50, 1, 1); // 1 = WITHDRAW
      const balance = await fundDApp.checkBalance(1);
      expect(balance).to.equal(50);
    });

    it("Should revert withdrawal with insufficient balance", async function () {
      const { fundDApp, addr1 } = await loadFixture(deployFundDAppFixture);
      await fundDApp.createUser("Bao", addr1.address);
      await expect(fundDApp.createTransaction(Date.now(), 50, 1, 1)).to.be.revertedWith("Insufficient balance");
    });
  });

  describe("Transaction management", function () {
    it("Should revert createTransaction if user does not exist", async function () {
      const { fundDApp } = await loadFixture(deployFundDAppFixture);
      await expect(fundDApp.createTransaction(Math.floor(Date.now() / 1000), 100, 0, 999)).to.be.revertedWith("User does not exist");
    });

    it("Should create and get a deposit transaction with correct date", async function () {
      const { fundDApp, addr1 } = await loadFixture(deployFundDAppFixture);
      await fundDApp.createUser("Bao", addr1.address);
      const now = Math.floor(Date.now() / 1000);
      await fundDApp.createTransaction(now, 100, 0, 1); // 0 = DEPOSIT

      const transaction = await fundDApp.getTransaction(1);
      expect(transaction[0]).to.equal(1); // transaction.id
      expect(transaction[1]).to.equal(now); // transaction.date
      expect(transaction[2]).to.equal(100); // transaction.amount
      expect(transaction[3]).to.equal(0); // transaction.transactionType (DEPOSIT)
      expect(transaction[4]).to.equal(1); // transaction.userId
    });

    it("Should create a withdraw transaction with correct date", async function () {
      const { fundDApp, addr1 } = await loadFixture(deployFundDAppFixture);
      await fundDApp.createUser("Bao", addr1.address);
      const now = Math.floor(Date.now() / 1000);
      await fundDApp.createTransaction(now, 100, 0, 1); // 0 = DEPOSIT
      await fundDApp.createTransaction(now, 50, 1, 1); // 1 = WITHDRAW

      const transaction = await fundDApp.getTransaction(2);
      expect(transaction[0]).to.equal(2); // transaction.id
      expect(transaction[1]).to.equal(now); // transaction.date
      expect(transaction[2]).to.equal(50); // transaction.amount
      expect(transaction[3]).to.equal(1); // transaction.transactionType (WITHDRAW)
      expect(transaction[4]).to.equal(1); // transaction.userId
    });

    it("Should not allow withdrawal with insufficient balance", async function () {
      const { fundDApp, addr1 } = await loadFixture(deployFundDAppFixture);
      await fundDApp.createUser("Bao", addr1.address);
      await expect(fundDApp.createTransaction(Math.floor(Date.now() / 1000), 50, 1, 1)).to.be.revertedWith("Insufficient balance");
    });
  });

  describe("Vote management", function () {
    it("Should revert createVote if user does not exist", async function () {
      const { fundDApp } = await loadFixture(deployFundDAppFixture);
      await expect(fundDApp.createVote("New feature", Math.floor(Date.now() / 1000), "Feature", 0, 999)).to.be.revertedWith("User does not exist");
    });

    it("Should create a vote", async function () {
      const { fundDApp, addr1 } = await loadFixture(deployFundDAppFixture);
      await fundDApp.createUser("Bao", addr1.address);
      await fundDApp.createVote("New feature", Math.floor(Date.now() / 1000), "Feature", 0, 1);
      const vote = await fundDApp.getVote(1);
      expect(vote[1]).to.equal("New feature"); // vote.description
    });

    it("Should revert voteRemoveMember if user does not exist", async function () {
      const { fundDApp } = await loadFixture(deployFundDAppFixture);
      await expect(fundDApp.voteRemoveMember(999)).to.be.revertedWith("User does not exist");
    });

    it("Should execute voteRemoveMember for existing user", async function () {
      const { fundDApp, addr1 } = await loadFixture(deployFundDAppFixture);
      await fundDApp.createUser("Bao", addr1.address);
      await fundDApp.voteRemoveMember(1);
      // Logic to verify member removal can be added here when implemented
    });

    it("Should revert voteWithdraw if user does not exist", async function () {
      const { fundDApp } = await loadFixture(deployFundDAppFixture);
      await expect(fundDApp.voteWithdraw(999, 100)).to.be.revertedWith("User does not exist");
    });

    it("Should execute voteWithdraw for existing user", async function () {
      const { fundDApp, addr1 } = await loadFixture(deployFundDAppFixture);
      await fundDApp.createUser("Bao", addr1.address);
      await fundDApp.createTransaction(Date.now(), 100, 0, 1); // 0 = DEPOSIT
      const tx = await fundDApp.voteWithdraw(1, 100);

      await expect(tx).to.emit(fundDApp, 'Withdraw').withArgs(1, 100);

      const user = await fundDApp.getUser(1);
      expect(user.balance).to.equal(0);
    });
  });

  describe("Notification management", function () {
    it("Should revert createNotification if user does not exist", async function () {
      const { fundDApp } = await loadFixture(deployFundDAppFixture);
      await expect(fundDApp.createNotification("Hello Bao", 999)).to.be.revertedWith("User does not exist");
    });

    it("Should create a notification", async function () {
      const { fundDApp, addr1 } = await loadFixture(deployFundDAppFixture);
      await fundDApp.createUser("Bao", addr1.address); // Create user with ID 1
      const tx = await fundDApp.createNotification("Hello Bao", 1); // Create notification for user ID 1

      await expect(tx).to.emit(fundDApp, 'NotificationCreated').withArgs(1, "Hello Bao", 1);

      // Get notification with ID 1 and check values
      const notification = await fundDApp.getNotification(1);
      expect(notification[0]).to.equal(1); // Notification ID
      expect(notification[1]).to.equal("Hello Bao"); // Notification message
      expect(notification[2]).to.equal(1); // User ID
    });
  });
});
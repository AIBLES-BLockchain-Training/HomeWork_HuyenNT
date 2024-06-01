const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Finance Contract", function () {
  let admin, user, manager, nonManager;
  let UserManager, FinancialContract, LoanManagerContract;
  let userManager, financialContract, loanManagerContract;

  beforeEach(async function () {
    [admin, user, manager, nonManager] = await ethers.getSigners();

    UserManager = await ethers.getContractFactory("UserManager");
    userManager = await UserManager.deploy();
    await userManager.waitForDeployment();

    FinancialContract = await ethers.getContractFactory("FinancialContract");
    financialContract = await FinancialContract.deploy();
    await financialContract.waitForDeployment();

    LoanManagerContract = await ethers.getContractFactory("LoanManagerContract");
    loanManagerContract = await LoanManagerContract.deploy();
    await loanManagerContract.waitForDeployment();

    // Set up roles
    await userManager.connect(admin).addUser(user.address, 0); // Role.USER
    await userManager.connect(admin).addUser(manager.address, 2); // Role.USER_MANAGER
    await loanManagerContract.connect(admin).addUser(nonManager.address, 0);
    expect(await userManager.getUserRole(user.address)).to.equal(0); // Role.USER
    expect(await userManager.getUserRole(manager.address)).to.equal(2); // Role.USER_MANAGER
    expect(await loanManagerContract.getUserRole(nonManager.address)).to.equal(0); // Role.USER
  });

  describe("UserManager", function () {
    it("should set the correct admin", async function () {
      expect(await userManager.admin()).to.equal(admin.address);
    });

    it("should allow admin to add a user", async function () {
      await userManager.connect(admin).addUser(user.address, 0); // Role.USER
      expect(await userManager.getUserRole(user.address)).to.equal(0); // Role.USER
    });

    it("should not allow non-admin to add a user", async function () {
      await expect(userManager.connect(user).addUser(user.address, 0)).to.be.revertedWith("Caller is not the admin");
    });

    it("should return the correct role for a user", async function () {
      await userManager.connect(admin).addUser(user.address, 0); // Role.USER
      expect(await userManager.getUserRole(user.address)).to.equal(0); // Role.USER
    });
  });

  describe("FinancialContract", function () {
    it("should allow user to deposit funds", async function () {
      await loanManagerContract.connect(user).deposit(100);
      expect(await loanManagerContract.balances(user.address)).to.equal(100);
    });

    it("should not allow non-user to deposit funds", async function () {
      await expect(loanManagerContract.connect(admin).deposit(100)).to.be.revertedWith("Only users can call this function");
    });

    it("should allow user to withdraw funds", async function () {
      await loanManagerContract.connect(user).deposit(100);
      await loanManagerContract.connect(user).withdraw(50);
      expect(await loanManagerContract.balances(user.address)).to.equal(50);
    });

    it("should not allow user to withdraw more than their balance", async function () {
      await loanManagerContract.connect(user).deposit(100);
      await expect(loanManagerContract.connect(user).withdraw(150)).to.be.revertedWith("Insufficient balance");
    });

    it("should not allow non-user to withdraw funds", async function () {
      await expect(loanManagerContract.connect(admin).withdraw(50)).to.be.revertedWith("Only users can call this function");
    });
  });

  describe("LoanManagerContract", function () {
    it("should allow user to initiate a loan request", async function () {
      await loanManagerContract.connect(user).initiateLoanRequest(100);
      const loanRequest = await loanManagerContract.loanRequests(user.address);
      expect(loanRequest.amount).to.equal(100);
      expect(loanRequest.isApproved).to.be.false;
    });

    it("should not allow user to initiate a loan request with amount zero", async function () {
      await expect(loanManagerContract.connect(user).initiateLoanRequest(0)).to.be.revertedWith("Invalid loan amount");
    });

    it("should allow manager to approve a loan request", async function () {
      await loanManagerContract.connect
    });

    it("should not allow non-manager to approve a loan request", async function () {
      await loanManagerContract.connect(user).initiateLoanRequest(100);
      await expect(loanManagerContract.connect(user).approveLoanRequest(user.address)).to.be.revertedWith("Only the manager can call this function");
    });
    it("should revert with 'Only the manager can call this function' when a non-manager attempts to approve a loan request", async function () {
      await loanManagerContract.connect(user).initiateLoanRequest(100);
      await expect(loanManagerContract.connect(nonManager).approveLoanRequest(user.address)).to.be.revertedWith("Only the manager can call this function");
    });
    it("should not allow manager to approve invalid loan requests", async function () {
      await expect(loanManagerContract.connect(manager).approveLoanRequest(user.address)).to.be.revertedWith("Only the manager can call this function");
    });
    it("should not allow user without active loan to repay", async function () {
      await expect(loanManagerContract.connect(user).repayLoan(50)).to.be.revertedWith("No active loan for the user");
    });
  })
  

});

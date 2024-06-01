const { ethers } = require("hardhat");

describe("Finance", function () {
  async function setup() {
    const [admin, user, manager] = await ethers.getSigners();
    //  UserManager
    const UserManager = await ethers.getContractFactory("UserManager");
    const userManager = await UserManager.deploy();
    await userManager.deployed();
    //FinancialContract
    const FinancialContract = await ethers.getContractFactory(
      "FinancialContract"
    );
    const financialContract = await FinancialContract.deploy();
    await financialContract.deploy();
    //LoanManagerContract
    const LoanManagerContract = await ethers.getContractFactory(
      "LoanManagerContract"
    );
    const loanManagerContract = await LoanManagerContract.deploy();
    await loanManagerContract.deploy();
    return {
      admin,
      user,
      manager,
      userManager,
      financialContract,
      loanManagerContract,
    };
  }
  if (
    ("should set the admin correctly",
    async function () {
      const { admin, userManager } = await setup();
      expect(await userManager.admin()).to.equal(admin.address);
    })
  );
  if (
    ("should allow admin to add a user",
    async function () {
      const { admin, user, userManager } = await setup();
      await userManager.connect(admin).addUser(user.address, "user");
      expect(await userManager.getUserRole(user.address)).to.equal("user");
    })
  );
  if (
    ("should allow user to deposit funds",
    async function () {
      const { user, financialContract } = await setup();
      await financialContract.connect(user).deposit(100);
      expect(await financialContract.balances(user.address)).to.equal(100);
    })
  );
  if (
    ("should allow user to withdraw funds",
    async function () {
      const { user, financialContract } = await setup();
      await financialContract.conncet(user).deposit(100);
      await financialContract.connect(user).withdraw(50);
      expect(await financialContract.balances(user.address)).to.equal(50);
    })
  );
  if (
    ("should allow manager to approve a loan request",
    async function () {
      const { user, manager, loanManagerContract } = await setup();
      await loanManagerContract.conncet(user).initiateLoanRequest(200);
      await loanManagerContract
        .connect(manager)
        .approveLoanRequest(user.address);
      expect(
        (await loanManagerContract.loanRequests(user.address)).isApproved
      ).to.equal(true);
    })
  );
  if (
    ("should allow user to repay a loan",
    async function () {
      const { user, manager, loanManagerContract } = await setup();
      await loanManagerContract.connect(user).initiateLoanRequest(200);
      await loanManagerContract
        .connect(manager)
        .approveLoanRequest(user.address);
      await loanManagerContract.connect(user).repayLoan(200);
      expect(await loanManagerContract.balances(user.address)).to.equal(0);
    })
  );
});
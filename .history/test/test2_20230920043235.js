const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Admin Contract", function () {
  let admin;
  let stableToken;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    const Admin = await ethers.getContractFactory("Admin");
    admin = await Admin.deploy();
    await admin.deployed();

    const StableToken = await ethers.getContractFactory("MockStableToken");
    stableToken = await StableToken.deploy();
    await stableToken.deployed();

    [owner, user1, user2] = await ethers.getSigners();

    // Initialize the Admin contract with the address of the stable token
    await admin.initialize(stableToken.address);

    // Transfer some stable tokens to the users
    await stableToken.transfer(user1.address, ethers.utils.parseEther("1000"));
    await stableToken.transfer(user2.address, ethers.utils.parseEther("1000"));

    // Approve the Admin contract to spend the users' stable tokens
    await stableToken.connect(user1).approve(admin.address, ethers.utils.parseEther("1000"));
    await stableToken.connect(user2).approve(admin.address, ethers.utils.parseEther("1000"));
  });

  describe("Use Case: Create, FrontPayout, and ApprovePayout with Debt Handling", function () {
    it("should create a commit with budget 50 and verify that debt increased after frontPayout", async function () {
      const budget = ethers.utils.parseEther("50");
      const numberOfTrees = 5;
      const timestamp = Math.floor(Date.now() / 1000);
  
      await admin.connect(owner).commitTree(user1.address, budget, numberOfTrees, timestamp);
  
      const commitId = 0;
      const frontPayoutAmount = ethers.utils.parseEther("20");
  
      // Check user debt before frontPayout
      const initialDebt = await admin.getUserBalance(user1.address);
  
      await admin.connect(user1).frontPayout(commitId, frontPayoutAmount, timestamp);
  
      // Check user debt after frontPayout
      const finalDebt = await admin.getUserBalance(user1.address);
      expect(finalDebt).to.equal(initialDebt.add(frontPayoutAmount));
    });
  
    it("should approve a payout of 15, verify that debt decreased, and no cUSD has been sent", async function () {
      const commitId = 0;
      const payoutAmount = ethers.utils.parseEther("15");
      const payoutMetadata = "Test metadata";
      const timestamp = Math.floor(Date.now() / 1000);
  
      // Check user debt before approvePayout
      const initialDebt = await admin.getUserBalance(user1.address);
  
      await admin.connect(user1).approvePayout(commitId, payoutAmount, payoutMetadata, timestamp);
  
      // Check user debt after approvePayout
      const finalDebt = await admin.getUserBalance(user1.address);
      expect(finalDebt).to.equal(initialDebt.sub(payoutAmount));
  
      // Check that no cUSD transfer happened
      const userBalanceAfterPayout = await stableToken.balanceOf(user1.address);
      expect(userBalanceAfterPayout).to.equal(ethers.utils.parseEther("1000"));
    });
  
    it("should approve a payout of 10, verify that debt has zeroed, and a cUSD transfer happened (value should not be 10)", async function () {
      const commitId = 0;
      const payoutAmount = ethers.utils.parseEther("10");
      const payoutMetadata = "Test metadata";
      const timestamp = Math.floor(Date.now() / 1000);
  
      // Check user debt before approvePayout
      const initialDebt = await admin.getUserBalance(user1.address);
  
      await admin.connect(user1).approvePayout(commitId, payoutAmount, payoutMetadata, timestamp);
  
      // Check user debt after approvePayout
      const finalDebt = await admin.getUserBalance(user1.address);
      expect(finalDebt).to.equal(ethers.utils.parseEther("0"));
  
      // Check that a cUSD transfer happened, and the value is not 10
      const userBalanceAfterPayout = await stableToken.balanceOf(user1.address);
      expect(userBalanceAfterPayout).to.not.equal(payoutAmount);
    });
  
    it("should approve a payout of 10, verify that debt remained zero, and a cUSD transfer happened (value should be 10)", async function () {
      const commitId = 0;
      const payoutAmount = ethers.utils.parseEther("10");
      const payoutMetadata = "Test metadata";
      const timestamp = Math.floor(Date.now() / 1000);
  
      // Check user debt before approvePayout
      const initialDebt = await admin.getUserBalance(user1.address);
  
      await admin.connect(user1).approvePayout(commitId, payoutAmount, payoutMetadata, timestamp);
  
      // Check user debt after approvePayout
      const finalDebt = await admin.getUserBalance(user1.address);
      expect(finalDebt).to.equal(ethers.utils.parseEther("0"));
  
      // Check that a cUSD transfer happened, and the value is 10
      const userBalanceAfterPayout = await stableToken.balanceOf(user1.address);
      expect(userBalanceAfterPayout).to.equal(payoutAmount);
    });
  });
  
});
  

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

  describe("Use Case: Create, FrontPayout, and ApprovePayout with Multiple Commits", function () {
    it("should create a commit 1 with budget 50, frontPayout to 1 for 20, and verify that debt increased", async function () {
      const budget1 = ethers.utils.parseEther("50");
      const numberOfTrees1 = 5;
      const timestamp1 = Math.floor(Date.now() / 1000);
  
      await admin.connect(owner).commitTree(user1.address, budget1, numberOfTrees1, timestamp1);
  
      const commitId1 = 0;
      const frontPayoutAmount1 = ethers.utils.parseEther("20");
  
      // Check user debt before frontPayout
      const initialDebt1 = await admin.getUserBalance(user1.address);
  
      await admin.connect(user1).frontPayout(commitId1, frontPayoutAmount1, timestamp1);
  
      // Check user debt after frontPayout
      const finalDebt1 = await admin.getUserBalance(user1.address);
      expect(finalDebt1).to.equal(initialDebt1.add(frontPayoutAmount1));
    });
  
    it("should approve a payout to commit 1 of 15, verify that debt decreased, and no cUSD has been sent", async function () {
      const commitId1 = 0;
      const payoutAmount1 = ethers.utils.parseEther("15");
      const payoutMetadata1 = "Test metadata 1";
      const timestamp1 = Math.floor(Date.now() / 1000);
  
      // Check user debt before approvePayout
      const initialDebt1 = await admin.getUserBalance(user1.address);
  
      await admin.connect(user1).approvePayout(commitId1, payoutAmount1, payoutMetadata1, timestamp1);
  
      // Check user debt after approvePayout
      const finalDebt1 = await admin.getUserBalance(user1.address);
      expect(finalDebt1).to.equal(initialDebt1.sub(payoutAmount1));
  
      // Check that no cUSD transfer happened
      const userBalanceAfterPayout1 = await stableToken.balanceOf(user1.address);
      expect(userBalanceAfterPayout1).to.equal(ethers.utils.parseEther("1000"));
    });
  
    it("should create a commit 2 with budget 50, frontPayout to commit 2 for 20, and verify that debt increased", async function () {
      const budget2 = ethers.utils.parseEther("50");
      const numberOfTrees2 = 5;
      const timestamp2 = Math.floor(Date.now() / 1000);
  
      await admin.connect(owner).commitTree(user1.address, budget2, numberOfTrees2, timestamp2);
  
      const commitId2 = 1;
      const frontPayoutAmount2 = ethers.utils.parseEther("20");
  
      // Check user debt before frontPayout
      const initialDebt2 = await admin.getUserBalance(user1.address);
  
      await admin.connect(user1).frontPayout(commitId2, frontPayoutAmount2, timestamp2);
  
      // Check user debt after frontPayout
      const finalDebt2 = await admin.getUserBalance(user1.address);
      expect(finalDebt2).to.equal(initialDebt2.add(frontPayoutAmount2));
    });
  
    it("should approve a payout to commit 1 of 10, verify that debt decreased, and no cUSD has been sent", async function () {
      const commitId1 = 0;
      const payoutAmount1 = ethers.utils.parseEther("10");
      const payoutMetadata1 = "Test metadata 1";
      const timestamp1 = Math.floor(Date.now() / 1000);
  
      // Check user debt before approvePayout
      const initialDebt1 = await admin.getUserBalance(user1.address);
  
      await admin.connect(user1).approvePayout(commitId1, payoutAmount1, payoutMetadata1, timestamp1);
  
      // Check user debt after approvePayout
      const finalDebt1 = await admin.getUserBalance(user1.address);
      expect(finalDebt1).to.equal(initialDebt1.sub(payoutAmount1));
  
      // Check that no cUSD transfer happened
      const userBalanceAfterPayout1 = await stableToken.balanceOf(user1.address);
      expect(userBalanceAfterPayout1).to.equal(ethers.utils.parseEther("1000"));
    });
  });  
  
});
  

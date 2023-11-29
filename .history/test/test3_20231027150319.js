<<<<<<< HEAD
=======
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
    it("Testing use case", async function () {
      const budget1 = ethers.utils.parseEther("50");
      const numberOfTrees1 = 5;
      const timestamp1 = Math.floor(Date.now() / 1000);
      await admin.connect(owner).commitTree(user2.address, budget1, numberOfTrees1, timestamp1);
      const commitId1 = 0;

      // Step 1: verify that debt increased after frontPayout
      const frontPayoutAmount1 = ethers.utils.parseEther("20");
      // Check user debt before frontPayout
      const initialDebt1 = await admin.getUserDebt(user2.address);
      await admin.connect(user1).frontPayout(commitId1, frontPayoutAmount1, timestamp1);
      // Check user debt after frontPayout
      const finalDebt1 = await admin.getUserDebt(user2.address);
      expect(finalDebt1).to.equal(initialDebt1.add(frontPayoutAmount1));

      // Step 2: should approve a payout to commit 1 of 15, verify that debt decreased, and no cUSD has been sent
      const userBalanceBeforePayout1 = await stableToken.balanceOf(user2.address);
      const payoutAmount1 = ethers.utils.parseEther("15");
      const payoutMetadata1 = "Test metadata 1";
      await admin.connect(user1).approvePayout(commitId1, payoutAmount1, payoutMetadata1, timestamp1);
      const finalDebtAfterPayout1 = await admin.getUserDebt(user2.address);
      expect(finalDebtAfterPayout1).to.equal(finalDebt1.sub(payoutAmount1));
      // Check that no cUSD transfer happened
      const userBalanceAfterPayout1 = await stableToken.balanceOf(user2.address);
      expect(userBalanceAfterPayout1).to.equal(userBalanceBeforePayout1);

      // Step 3: should create a commit 2 with budget 60, frontPayout to commit 2 for 20, and verify that debt increased
      const budget2 = ethers.utils.parseEther("60");
      const numberOfTrees2 = 5;
      const timestamp2 = Math.floor(Date.now() / 1000);
      await admin.connect(owner).commitTree(user2.address, budget2, numberOfTrees2, timestamp2);
      const commitId2 = 1;
      const frontPayoutAmount2 = ethers.utils.parseEther("20");
      // Check user debt before frontPayout
      const initialDebt2 = await admin.getUserDebt(user2.address);
      await admin.connect(user1).frontPayout(commitId2, frontPayoutAmount2, timestamp2);
      // Check user debt after frontPayout
      const finalDebt2 = await admin.getUserDebt(user2.address);
      expect(finalDebt2).to.equal(initialDebt2.add(frontPayoutAmount2));

      // Step 4: should approve a payout to commit 1 of 10, verify that debt decreased, and no cUSD has been sent
      const userBalanceBeforePayout2 = await stableToken.balanceOf(user2.address);
      const payoutAmount2 = ethers.utils.parseEther("10");
      const payoutMetadata2 = "Test metadata 2";
      await admin.connect(user1).approvePayout(commitId1, payoutAmount2, payoutMetadata2, timestamp1);
      const finalDebtAfterPayout2 = await admin.getUserDebt(user2.address);
      expect(finalDebtAfterPayout2).to.equal(finalDebt2.sub(payoutAmount2));
      // Check that no cUSD transfer happened
      const userBalanceAfterPayout2 = await stableToken.balanceOf(user2.address);
      expect(userBalanceAfterPayout2).to.equal(userBalanceBeforePayout2);
    });
  });
});
>>>>>>> e693a8b86a5ced2ac24b2b871b4f4be2cd381a07
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
    it("Testing use case", async function () {
      const budget1 = ethers.utils.parseEther("50");
      const numberOfTrees1 = 5;
      const timestamp1 = Math.floor(Date.now() / 1000);
      await admin.connect(owner).commitTree(user2.address, budget1, numberOfTrees1, timestamp1);
      const commitId1 = 0;

      // Step 1: verify that debt increased after frontPayout
      const frontPayoutAmount1 = ethers.utils.parseEther("20");
      // Check user debt before frontPayout
      const initialDebt1 = await admin.getUserDebt(user2.address);
      await admin.connect(user1).frontPayout(commitId1, frontPayoutAmount1, timestamp1);
      // Check user debt after frontPayout
      const finalDebt1 = await admin.getUserDebt(user2.address);
      expect(finalDebt1).to.equal(initialDebt1.add(frontPayoutAmount1));

      // Step 2: should approve a payout to commit 1 of 15, verify that debt decreased, and no cUSD has been sent
      const userBalanceBeforePayout1 = await stableToken.balanceOf(user2.address);
      const payoutAmount1 = ethers.utils.parseEther("15");
      const payoutMetadata1 = "Test metadata 1";
      await admin.connect(user1).approvePayout(commitId1, payoutAmount1, payoutMetadata1, timestamp1);
      const finalDebtAfterPayout1 = await admin.getUserDebt(user2.address);
      expect(finalDebtAfterPayout1).to.equal(finalDebt1.sub(payoutAmount1));
      // Check that no cUSD transfer happened
      const userBalanceAfterPayout1 = await stableToken.balanceOf(user2.address);
      expect(userBalanceAfterPayout1).to.equal(userBalanceBeforePayout1);

      // Step 3: should create a commit 2 with budget 60, frontPayout to commit 2 for 20, and verify that debt increased
      const budget2 = ethers.utils.parseEther("60");
      const numberOfTrees2 = 5;
      const timestamp2 = Math.floor(Date.now() / 1000);
      await admin.connect(owner).commitTree(user2.address, budget2, numberOfTrees2, timestamp2);
      const commitId2 = 1;
      const frontPayoutAmount2 = ethers.utils.parseEther("20");
      // Check user debt before frontPayout
      const initialDebt2 = await admin.getUserDebt(user2.address);
      await admin.connect(user1).frontPayout(commitId2, frontPayoutAmount2, timestamp2);
      // Check user debt after frontPayout
      const finalDebt2 = await admin.getUserDebt(user2.address);
      expect(finalDebt2).to.equal(initialDebt2.add(frontPayoutAmount2));

      // Step 4: should approve a payout to commit 1 of 10, verify that debt decreased, and no cUSD has been sent
      const userBalanceBeforePayout2 = await stableToken.balanceOf(user2.address);
      const payoutAmount2 = ethers.utils.parseEther("10");
      const payoutMetadata2 = "Test metadata 2";
      await admin.connect(user1).approvePayout(commitId1, payoutAmount2, payoutMetadata2, timestamp1);
      const finalDebtAfterPayout2 = await admin.getUserDebt(user2.address);
      expect(finalDebtAfterPayout2).to.equal(finalDebt2.sub(payoutAmount2));
      // Check that no cUSD transfer happened
      const userBalanceAfterPayout2 = await stableToken.balanceOf(user2.address);
      expect(userBalanceAfterPayout2).to.equal(userBalanceBeforePayout2);
    });
  });
});
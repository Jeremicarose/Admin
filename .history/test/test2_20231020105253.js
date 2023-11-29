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
    it("Testing use case", async function () {
      const budget = ethers.utils.parseEther("50");
      const numberOfTrees = 5;
      const timestamp = Math.floor(Date.now() / 1000);
      await admin.connect(owner).commitTree(user2.address, budget, numberOfTrees, timestamp);
      const commitId = 0;

      // Step 1: verify that debt increased after frontPayout
      const frontPayoutAmount = ethers.utils.parseEther("20");
      // Check user debt before frontPayout
      const initialDebt = await admin.getUserDebt(user2.address);
      await admin.connect(user1).frontPayout(commitId, frontPayoutAmount, timestamp);
      // Check user debt after frontPayout
      const finalDebt1 = await admin.getUserDebt(user2.address);
      expect(finalDebt1).to.equal(initialDebt.add(frontPayoutAmount));

      // Step 2: should approve a payout of 15, verify that debt decreased, and no cUSD has been sent
      const userBalanceBeforePayout1 = await stableToken.balanceOf(user2.address);
      const payoutAmount1 = ethers.utils.parseEther("15");
      const payoutMetadata1 = "Test metadata";
      await admin.connect(user1).approvePayout(commitId, payoutAmount1, payoutMetadata1, timestamp);
      // Check user debt after approvePayout
      const finalDebtAfterPayout1 = await admin.getUserDebt(user2.address);
      expect(finalDebtAfterPayout1).to.equal(finalDebt1.sub(payoutAmount1));
      // Check that no cUSD transfer happened
      const userBalanceAfterPayout1 = await stableToken.balanceOf(user2.address);
      expect(userBalanceAfterPayout1).to.equal(userBalanceBeforePayout1);

      // Step 3: should approve a payout of 15, verify that debt has zeroed, and a cUSD transfer happened (value should not be 10)
      const userBalanceBeforePayout2 = await stableToken.balanceOf(user2.address);
      const payoutAmount2 = ethers.utils.parseEther("15");
      const payoutMetadata2 = "Test metadata";
      await admin.connect(user1).approvePayout(commitId, payoutAmount2, payoutMetadata2, timestamp);
      const finalDebtAfterPayout2 = await admin.getUserDebt(user2.address);
      expect(finalDebtAfterPayout2).to.equal(ethers.utils.parseEther("0"));
      // Check that a cUSD transfer happened, and the value is not 15
      const userBalanceAfterPayout2 = await stableToken.balanceOf(user2.address);
      expect(userBalanceAfterPayout2).to.equal(userBalanceBeforePayout2.add(ethers.utils.parseEther("10")));

      // Step 4: should approve a payout of 5, verify that debt remained zero, and a cUSD transfer happened (value should be 5)
      const userBalanceBeforePayout3 = await stableToken.balanceOf(user2.address);
      const payoutAmount3 = ethers.utils.parseEther("5");
      const payoutMetadata3 = "Test metadata";
      await admin.connect(user1).approvePayout(commitId, payoutAmount3, payoutMetadata3, timestamp);
      const finalDebtAfterPayout3 = await admin.getUserDebt(user2.address);
      expect(finalDebtAfterPayout3).to.equal(ethers.utils.parseEther("0"));
      const userBalanceAfterPayout3 = await stableToken.balanceOf(user2.address);
      expect(userBalanceAfterPayout3).to.equal(userBalanceBeforePayout3.add(ethers.utils.parseEther("5")));
    });
  });
});

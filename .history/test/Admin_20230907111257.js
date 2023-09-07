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

  describe("Step 1: Check the commitTree function", function () {
    it("Point a) should create a commit with valid parameters", async function () {
      const budget = ethers.utils.parseEther("100");
      const numberOfTrees = 5;
      const timestamp = Math.floor(Date.now() / 1000);

      await admin.connect(owner).commitTree(user1.address, budget, numberOfTrees, timestamp);

      const commit = await admin.getCommitBalance(0);
      expect(commit).to.equal(budget);
    });

    it("Point b) should throw an error if owner is a zero address", async function () {
      const budget = ethers.utils.parseEther("100");
      const numberOfTrees = 5;
      const timestamp = Math.floor(Date.now() / 1000);

      await expect(admin.connect(owner).commitTree(ethers.constants.AddressZero, budget, numberOfTrees, timestamp)).to.be.revertedWith("Zero address for owner");
    });

    it("Point b) should create a commit if owner is not a zero address", async function () {
      const budget = ethers.utils.parseEther("100");
      const numberOfTrees = 5;
      const timestamp = Math.floor(Date.now() / 1000);

      await admin.connect(owner).commitTree(user1.address, budget, numberOfTrees, timestamp);

      const commit = await admin.getCommitBalance(0);
      expect(commit).to.equal(budget);
    });

    it("Point c) should throw an error if budget is not greater than zero", async function () {
      const budget = ethers.utils.parseEther("0");
      const numberOfTrees = 5;
      const timestamp = Math.floor(Date.now() / 1000);

      await expect(admin.connect(owner).commitTree(user1.address, budget, numberOfTrees, timestamp)).to.be.revertedWith("Budget must be greater than 0");
    });

    it("Point c) should throw an error if numberOfTrees is not greater than zero", async function () {
      const budget = ethers.utils.parseEther("100");
      const numberOfTrees = 0;
      const timestamp = Math.floor(Date.now() / 1000);

      await expect(admin.connect(owner).commitTree(user1.address, budget, numberOfTrees, timestamp)).to.be.revertedWith("Number of trees must be greater than 0");
    });

    it("Point c) should create a commit if budget and numberOfTrees are greater than zero", async function () {
      const budget = ethers.utils.parseEther("100");
      const numberOfTrees = 5;
      const timestamp = Math.floor(Date.now() / 1000);

      await admin.connect(owner).commitTree(user1.address, budget, numberOfTrees, timestamp);

      const commit = await admin.getCommitBalance(0);
      expect(commit).to.equal(budget);
    });
  });

  describe("Step 2: Check the frontPayout function", function () {
    it("should throw an error if the commit with the given commitId does not exist", async function () {
      const commitId = 6;
      const payoutAmount = ethers.utils.parseEther("10");
      const timestamp = Math.floor(Date.now() / 1000);

      await expect(admin.connect(user1).frontPayout(commitId, payoutAmount, timestamp)).to.be.revertedWith("No commits exist for that id");
    });

    it("should throw an error if the budget for the commit has been fully spent", async function () {
      const budget = ethers.utils.parseEther("100");
      const numberOfTrees = 5;
      const timestamp = Math.floor(Date.now() / 1000);

      await admin.connect(owner).commitTree(user1.address, budget, numberOfTrees, timestamp);

      const commitId = 0;
      const payoutAmount = ethers.utils.parseEther("110");

      // Spend the budget to ensure it's fully spent
      await admin.connect(user1).frontPayout(commitId, budget, timestamp);

      await expect(admin.connect(user1).frontPayout(commitId, payoutAmount, timestamp)).to.be.revertedWith("Budget has been fully spent");
  });
    

    it("should correctly calculate the actualPayoutAmount based on the remaining budget and add it to the user's debt", async function () {
      const budget = ethers.utils.parseEther("100");
      const numberOfTrees = 5;
      const timestamp = Math.floor(Date.now() / 1000);

      await admin.connect(owner).commitTree(user1.address, budget, numberOfTrees, timestamp);

      const commitId = 0;
      const payoutAmount = ethers.utils.parseEther("50");

      // Check user debt before payout
      const initialDebt = await admin.getUserDebt(user1.address);

      await admin.connect(user1).frontPayout(commitId, payoutAmount, timestamp);

      const remainingBudget = await admin.getCommitBalance(commitId);
      expect(remainingBudget).to.equal(budget.sub(payoutAmount));

      // Check user debt after payout
      const finalDebt = await admin.getUserDebt(user1.address);
      expect(finalDebt).to.equal(initialDebt.add(payoutAmount));
    });
  });


  describe("Step 3: Check the approvePayout function", function () {
    it("should throw an error if the commit with the given commitId does not exist", async function () {
      const commitId = 0;
      const payoutAmount = ethers.utils.parseEther("10");
      const payoutMetadata = "Test metadata";
      const timestamp = Math.floor(Date.now() / 1000);
  
      await expect(admin.connect(user1).approvePayout(commitId, payoutAmount, payoutMetadata, timestamp)).to.be.revertedWith("No commits exist for that id");
    });
  
    it("should throw an error if the user's debt is less than the payout amount", async function () {
      const budget = ethers.utils.parseEther("100");
      const numberOfTrees = 5;
      const timestamp = Math.floor(Date.now() / 1000);
  
      await admin.connect(owner).commitTree(user1.address, budget, numberOfTrees, timestamp);
  
      const commitId = 0;
      const payoutAmount = ethers.utils.parseEther("110");
      const payoutMetadata = "Test metadata";
  
      // Set the user's debt to be less than the payout amount
      const frontPayoutAmount = ethers.utils.parseEther("50");
      await admin.connect(user1).frontPayout(commitId, frontPayoutAmount, timestamp);
  
      await expect(admin.connect(user1).approvePayout(commitId, payoutAmount, payoutMetadata, timestamp)).to.be.revertedWith("Insufficient balance");
  });
  
    
  
    it("should correctly calculate the actualPayoutAmount based on the user's debt and subtract it from the user's debt", async function () {
      const budget = ethers.utils.parseEther("100");
      const numberOfTrees = 5;
      const timestamp = Math.floor(Date.now() / 1000);
  
      await admin.connect(owner).commitTree(user1.address, budget, numberOfTrees, timestamp);
  
      const commitId = 0;
      const payoutAmount = ethers.utils.parseEther("50");
      const payoutMetadata = "Test metadata";
  
      // Call frontPayout to add to the user's debt
      await admin.connect(user1).frontPayout(commitId, payoutAmount, timestamp);
  
      // Check user debt before approvePayout
      const initialDebt = await admin.getUserDebt(user1.address);
  
      await admin.connect(user1).approvePayout(commitId, payoutAmount, payoutMetadata, timestamp);
  
      // Check user debt after approvePayout
      const finalDebt = await admin.getUserDebt(user1.address);
      expect(finalDebt).to.equal(initialDebt.sub(payoutAmount));
    });
});


  
  
});
  

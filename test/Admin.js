const { expect } = require("chai");
<<<<<<< HEAD
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
      const frontPayoutAmount = ethers.utils.parseEther("45");
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
  
=======
const { ethers, upgrades } = require("hardhat");

describe("TestAdmin", () => {


  before(async function () {
    this.StableTokenContract = await ethers.getContractFactory(
      "MockStableToken"
    );
    this.AdminContract = await ethers.getContractFactory("Admin");
  });

  beforeEach(async function () {
    this.stableToken = await this.StableTokenContract.deploy();
    await this.stableToken.deployed();

    const AdminContract = await ethers.getContractFactory("Admin");
    this.admin = await upgrades.deployProxy(this.AdminContract, [
      this.stableToken.address,
    ]);
    await this.admin.deployed();
  });

  describe("commitTree", function () {
    it("should revert if owner address is zero", async function () {
      await expect(
        this.admin.commitTree(ethers.constants.AddressZero, 100, 1500, 100000)
      ).to.be.revertedWith("Zero address for owner");
    });

    it("should revert if budget is not greater than zero", async function () {
      const [owner, addr1] = await ethers.getSigners();
      await expect(
        this.admin.commitTree(addr1.address, 0, 1500, 100000)
      ).to.be.revertedWith("Budget must be greater than 0");
    });

    it("should revert if numberOfTrees is not greater than zero", async function () {
      const [owner, addr1] = await ethers.getSigners();
      await expect(
        this.admin.commitTree(addr1.address, 100, 0, 100000)
      ).to.be.revertedWith("Number of trees must be greater than 0");
    });

    it("should emit CommitCreated event on successful commit", async function () {
      const [owner, addr1] = await ethers.getSigners();
      const tx = await this.admin.commitTree(addr1.address, 100, 1500, 100000);

      expect(tx)
        .to.emit(this.admin, "CommitCreated")
        .withArgs(addr1.address, 100000, 0, 100, 1500);
    });
  });

  describe("frontPayout", function () {
    beforeEach(async function () {
      const [owner, addr1] = await ethers.getSigners();
      await this.admin.commitTree(addr1.address, 100, 1500, 100000);
    });

    it("should revert if commitId does not exist", async function () {
      await expect(this.admin.frontPayout(12, 20, 100000)).to.be.revertedWith(
        "No commits exist for that id"
      );
    });

    it("should revert if allowance is not increased", async function () {
      await expect(this.admin.frontPayout(0, 20, 100000)).to.be.revertedWith(
        "ERC20: insufficient allowance"
      );
    });

    it("should transfer tokens and emit PayoutSent event on successful payout", async function () {
      const [owner, addr1] = await ethers.getSigners();

      await this.stableToken.increaseAllowance(this.admin.address, 20);

      const prevOwnerBalance = await this.stableToken.balanceOf(owner.address);
      const prevAddr1Balance = await this.stableToken.balanceOf(addr1.address);
      const prevUserBalance = await this.admin.getUserBalance(addr1.address);

      await expect(this.admin.frontPayout(0, 20, 100000))
        .to.emit(this.admin, "PayoutSent")
        .withArgs(0, addr1.address, 100000, true, 20, "");

      expect(await this.stableToken.balanceOf(owner.address)).to.equal(
        prevOwnerBalance - 20
      );
      expect(await this.stableToken.balanceOf(addr1.address)).to.equal(
        prevAddr1Balance + 20
      );
      expect(await this.admin.getUserBalance(addr1.address)).to.equal(
        prevUserBalance + 20
      );
    });

    it("should revert if payout exceeds the budget", async function () {
      const [owner, addr1] = await ethers.getSigners();

      await this.stableToken.increaseAllowance(this.admin.address, 2000);

      await expect(this.admin.frontPayout(0, 2000, 100000)).to.be.revertedWith(
        "Payout will exceed the budget"
      );
    });

    
  });

  describe("approvePayout", function () {
    beforeEach(async function () {
      const [owner, addr1] = await ethers.getSigners();
      await this.admin.commitTree(addr1.address, 100, 1500, 100000);
    });

    it("should revert if commitId does not exist", async function () {
      await expect(
        this.admin.approvePayout(12, 20, "", 100000)
      ).to.be.revertedWith("No commits exist for that id");
    });

    it("should revert if allowance is not increased", async function () {
      await expect(
        this.admin.approvePayout(0, 20, "", 100000)
      ).to.be.revertedWith("ERC20: insufficient allowance");
    });

    it("should transfer tokens and emit PayoutSent event on successful payout", async function () {
      const [owner, addr1] = await ethers.getSigners();

      await this.stableToken.increaseAllowance(this.admin.address, 20);

      const prevOwnerBalance = await this.stableToken.balanceOf(owner.address);
      const prevAddr1Balance = await this.stableToken.balanceOf(addr1.address);
      const prevUserBalance = await this.admin.getUserBalance(addr1.address);

      await expect(this.admin.approvePayout(0, 20, "", 100000))
        .to.emit(this.admin, "PayoutSent")
        .withArgs(0, addr1.address, 100000, false, 20, "");

      expect(await this.stableToken.balanceOf(owner.address)).to.equal(
        prevOwnerBalance - 20
      );
      expect(await this.stableToken.balanceOf(addr1.address)).to.equal(
        prevAddr1Balance + 20
      );
      expect(await this.admin.getUserBalance(addr1.address)).to.equal(
        prevUserBalance + 20
      );
    });

    it("should revert if payout exceeds the budget", async function () {
      const [owner, addr1] = await ethers.getSigners();

      await this.stableToken.increaseAllowance(this.admin.address, 2000);

      await expect(
        this.admin.approvePayout(0, 2000, "", 100000)
      ).to.be.revertedWith("Payout will exceed the budget");
    });

    
  });

 describe("getCommitBalance", function () {
  beforeEach(async function () {
    const [owner, addr1] = await ethers.getSigners();
    await this.admin.commitTree(addr1.address, 100, 1500, 100);
  });

  it("should return the correct commit balance", async function () {
    const commitBalance = await this.admin.getCommitBalance(0);
    expect(commitBalance).to.equal(100);
  });

  it("should return the correct commit balance after a payout", async function () {
    const [owner, addr1] = await ethers.getSigners();

    await this.stableToken.increaseAllowance(this.admin.address, 20);
    await this.admin.approvePayout(0, 20, "", 100);

    const commitBalance = await this.admin.getCommitBalance(0);
    expect(commitBalance).to.equal(100 - 20);
  });

 
});

  
});
>>>>>>> 3f438a317730443d2010b55bbe7580aa8f8630a0

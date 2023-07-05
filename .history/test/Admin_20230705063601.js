const { expect } = require("chai");
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
    await this.admin.commitTree();
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
  
    it("should revert if commitId does not exist", async function () {
      await expect(this.admin.getCommitBalance(12)).to.be.revertedWith(
        "No commits exist for that id"
      );
    });
  });
  
  
});

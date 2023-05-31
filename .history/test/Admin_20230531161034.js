const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("TestAdmin", () => {
  let admin;
  let stableToken;

  before(async function () {
    this.StableTokenContract = await ethers.getContractFactory("MockStableToken");
    this.AdminContract = await ethers.getContractFactory("Admin");
  });

  beforeEach(async function () {
    this.stableToken = await this.StableTokenContract.deploy();
    await this.stableToken.deployed();
  
    this.admin = await upgrades.deployProxy(this.AdminContract, [this.stableToken.address]);
    await this.admin.deployed();
  });
  

  describe("commit trees", function() {
    it("should revert if owner address is zero", async function () {
      await expect(
        this.admin.commitTree(
          "0x0000000000000000000000000000000000000000",
          100,
          1500,
          100000
        )
      ).to.be.revertedWith("Zero address for owner");
    });

    it("should revert if budget is not greater than zero", async function () {
      const [owner, addr1] = await ethers.getSigners();
      await expect(
        this.admin.commitTree(
          addr1.address,
          0,
          1500,
          100000
        )
      ).to.be.revertedWith("Budget must be greater than 0");
    });

    it("should revert if number of trees is not greater than zero", async function () {
      const [owner, addr1] = await ethers.getSigners();
      await expect(
        this.admin.commitTree(
          addr1.address,
          100,
          0,
          100000
        )
      ).to.be.revertedWith("Number of trees must be greater than 0");
    });

    it("should create commit and emit CommitCreated event", async function () {
      const [owner, addr1] = await ethers.getSigners();
      
      await expect(
        this.admin.commitTree(
          addr1.address,
          100,
          1500,
          100000
        )
      )
        .to.emit(this.admin, "CommitCreated")
        .withArgs(addr1.address, 100000, 0, 100, 1500);
    });
  });

  describe("front payout", function() {
    beforeEach(async function () {
      const [owner, addr1] = await ethers.getSigners();
      await this.admin.commitTree(addr1.address, 100, 1500, 100000);
    });

    it("should revert if commit ID does not exist", async function () {
      await expect(this.admin.frontPayout(12, 20, 100000))
        .to.be.revertedWith("No commits exist for that id");
    });

    it("should revert if allowance is not increased", async function () {
      await expect(this.admin.frontPayout(0, 20, 100000))
        .to.be.revertedWith("ERC20: insufficient allowance");
    });

    it("should send payout and emit PayoutSent event", async function () {
      const [owner, addr1] = await ethers.getSigners();

      await this.stableToken.increaseAllowance(this.admin.address, 20);

      const prevOwnerBalance = await this.stableToken.balanceOf(owner.address);
      const prevAddr1Balance = await this.stableToken.balanceOf(addr1.address);

      await expect(this.admin.frontPayout(0, 20, 100000))
        .to.emit(this.admin, "PayoutSent")
        .withArgs(0, addr1.address, 100000, true, 20, 20, "");

      expect(await this.stableToken.balanceOf(owner.address)).to.equal(
        prevOwnerBalance - 20
      );
      expect(await this.stableToken.balanceOf(addr1.address)).to.equal(
        prevAddr1Balance + 20
      );
    });
  });
});

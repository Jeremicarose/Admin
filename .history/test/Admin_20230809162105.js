const { expect } = require("chai");
const { ethers, waffle, upgrades } = require("hardhat");
const { utils } = require('ethers');
const { deployContract, solidity } = waffle;

describe("TestAdmin", function() {
    before(async function () {
        this.StableTokenContract = await ethers.getContractFactory("MockStableToken");
        this.AdminContract = await ethers.getContractFactory("Admin");
    });

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        this.stableToken = await this.StableTokenContract.deploy(owner.address);
        await this.stableToken.deployed();

        this.admin = await upgrades.deployProxy(this.AdminContract, [this.stableToken.address]);
        await this.admin.deployed();

        // Mint and approve some tokens for payments
        await this.stableToken.mint(addr1.address, utils.parseEther('2000'));
        await this.stableToken.connect(addr1).approve(this.admin.address, utils.parseEther('2000'));
    });

    it("should allow committing of trees", async function () {
        await expect(this.admin.connect(addr1).commitTree(100, utils.parseEther('500')))
            .to.emit(this.admin, 'CommitCreated')
            .withArgs(1, addr1.address, 100, utils.parseEther('500'));
    });

    it("should allow front payout if the commit exists and there is enough budget", async function () {
        await this.admin.connect(addr1).commitTree(100, utils.parseEther('500'));
        await expect(this.admin.connect(addr1).frontPayout(1, utils.parseEther('200')))
            .to.emit(this.admin, 'PayoutSent')
            .withArgs(1, addr1.address, true, utils.parseEther('200'));
        expect(await this.stableToken.balanceOf(addr1.address)).to.equal(utils.parseEther('1800'));
    });

    it("should not allow front payment if the commit does not exist", async function () {
        await expect(this.admin.connect(addr1).frontPayout(3, utils.parseEther('200')))
            .to.be.revertedWith('Front payment to non-existent commit');
    });

    it("should not allow front payment if the budget is too low", async function () {
        await this.admin.connect(addr1).commitTree(100, utils.parseEther('100'));
        await expect(this.admin.connect(addr1).frontPayout(2, utils.parseEther('200')))
            .to.be.revertedWith('Not enough budget left');
    });

    it("should allow the approval of payouts if the budget is high enough", async function () {
        await this.admin.connect(addr1).commitTree(100, utils.parseEther('500'));
        await expect(this.admin.connect(addr1).approvePayout(1, utils.parseEther('200'), 'metadata'))
            .to.emit(this.admin, 'PayoutSent')
            .withArgs(1, addr1.address, false, utils.parseEther('200'), 'metadata');
        expect(await this.stableToken.balanceOf(addr1.address)).to.equal(utils.parseEther('1800'));
    });

    it("should not allow the approval of a payout if the budget is too low", async function () {
        await this.admin.connect(addr1).commitTree(100, utils.parseEther('100'));
        await expect(this.admin.connect(addr1).approvePayout(2, utils.parseEther('200'), 'metadata'))
            .to.be.revertedWith('Not enough budget left');
    });
});

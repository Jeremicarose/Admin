const { ethers, upgrades, waffle } = require("hardhat");
const { expect } = require("chai");
const { utils } = ethers;
const { deployMockContract } = waffle;

describe("TestAdmin", function () {
  let admin;
  let stableToken;
  let addr1;
  let addr2;
  let owner;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const Admin = await ethers.getContractFactory("Admin");
    admin = await upgrades.deployProxy(Admin, [owner.address]);
    await admin.deployed();

    const MockStableToken = await ethers.getContractFactory("MockStableToken");
    stableToken = await MockStableToken.deploy(owner.address);
    await stableToken.deployed();
  });

  it("should allow committing of trees", async function () {
    await admin.commitTree(1, utils.parseEther("100"));
    const tree = await admin.trees(1);
    expect(tree.commit).to.equal(true);
    expect(tree.budget).to.equal(utils.parseEther("100"));
  });

  it("should allow front payout if the commit exists and there is enough budget", async function () {
    await admin.commitTree(1, utils.parseEther("200"));
    await admin.frontPayout(1, utils.parseEther("200"), "Front payout reason");
    const tree = await admin.trees(1);
    expect(tree.frontPayout).to.equal(true);
  });

  it("should not allow front payment if the commit does not exist", async function () {
    await expect(
      admin.frontPayout(3, utils.parseEther("200"), "Front payout reason")
    ).to.be.revertedWith("Commit does not exist");
  });

  it("should not allow front payment if the budget is too low", async function () {
    await admin.commitTree(2, utils.parseEther("100"));
    await expect(
      admin.frontPayout(2, utils.parseEther("200"), "Front payout reason")
    ).to.be.revertedWith("Not enough budget left");
  });

  it("should allow the approval of payouts if the budget is high enough", async function () {
    await admin.commitTree(1, utils.parseEther("200"));
    await admin.frontPayout(1, utils.parseEther("200"), "Front payout reason");
    await admin.approvePayout(1, utils.parseEther("200"), "metadata", "Payout approval reason");
    const tree = await admin.trees(1);
    expect(tree.approvedPayout).to.equal(true);
  });

  it("should not allow the approval of a payout if the budget is too low", async function () {
    await admin.commitTree(2, utils.parseEther("100"));
    await admin.frontPayout(2, utils.parseEther("100"), "Front payout reason");
    await expect(
      admin.approvePayout(2, utils.parseEther("200"), "metadata", "Payout approval reason")
    ).to.be.revertedWith("Not enough budget left");
  });

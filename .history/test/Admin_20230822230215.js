const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Admin Contract', function () {
  let admin;
  let stableToken;
  let userAddress;

  beforeEach(async function () {
    const Admin = await ethers.getContractFactory('Admin');
    admin = await Admin.deploy();
    await admin.deployed();

    const StableToken = await ethers.getContractFactory('MockStableToken');
    stableToken = await StableToken.deploy();
    await stableToken.deployed();

    // Set user address
    [userAddress] = await ethers.getSigners();
  });

  it('should create a commit', async function () {
    const budget = 100;
    const numberOfTrees = 5;
    const timestamp = Math.floor(Date.now() / 1000);

    await admin.commitTree(userAddress.address, budget, numberOfTrees, timestamp);

    const commit = await admin.commits(0);
    expect(commit.owner).to.equal(userAddress.address);
    expect(commit.budget).to.equal(budget);
    expect(commit.numberOfTrees).to.equal(numberOfTrees);
  });

  it('should front payout', async function () {
    const budget = 100;
    const numberOfTrees = 5;
    const timestamp = Math.floor(Date.now() / 1000);

    await admin.commitTree(userAddress.address, budget, numberOfTrees, timestamp);

    const commit = await admin.commits(0);
    const commitId = commit.id;
    const payoutAmount = 50;

    await expect(admin.frontPayout(commitId, payoutAmount, timestamp))
      .to.emit(admin, 'PayoutSent')
      .withArgs(commitId, userAddress.address, timestamp, true, payoutAmount, '');

    const userBalance = await admin.getUserBalance(userAddress.address);
    expect(userBalance).to.equal(50);

    const commitBalance = await admin.getCommitBalance(commitId);
    expect(commitBalance).to.equal(50);
  });

  it('should approve payout', async function () {
    const budget = 100;
    const numberOfTrees = 5;
    const timestamp = Math.floor(Date.now() / 1000);

    await admin.commitTree(userAddress.address, budget, numberOfTrees, timestamp);

    const commit = await admin.commits(0);
    const commitId = commit.id;
    const payoutAmount = 50;
    const payoutMetadata = 'Payout approved';

    await expect(admin.approvePayout(commitId, payoutAmount, payoutMetadata, timestamp))
      .to.emit(admin, 'PayoutSent')
      .withArgs(commitId, userAddress.address, timestamp, false, payoutAmount, payoutMetadata);

    const userBalance = await admin.getUserBalance(userAddress.address);
    expect(userBalance).to.equal(50);

    const commitBalance = await admin.getCommitBalance(commitId);
    expect(commitBalance).to.equal(50);
  });

  it('should get user balance', async function () {
    const budget = 100;
    const numberOfTrees = 5;
    const timestamp = Math.floor(Date.now() / 1000);

    await admin.commitTree(userAddress.address, budget, numberOfTrees, timestamp);

    const commit = await admin.commits(0);
    const commitId = commit.id;
    const payoutAmount = 50;

    await admin.frontPayout(commitId, payoutAmount, timestamp);

    const userBalance = await admin.getUserBalance(userAddress.address);
    expect(userBalance).to.equal(50);
  });

  it('should get commit balance', async function () {
    const budget = 100;
    const numberOfTrees = 5;
    const timestamp = Math.floor(Date.now() / 1000);

    await admin.commitTree(userAddress.address, budget, numberOfTrees, timestamp);

    const commit = await admin.commits(0);
    const commitId = commit.id;

    const commitBalance = await admin.getCommitBalance(commitId);
    expect(commitBalance).to.equal(100);
  });
});

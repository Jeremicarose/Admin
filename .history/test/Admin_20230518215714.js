const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RewardsContract", async function () {
  // Create a new instance of the contract
  const rewardsContract = await ethers.getContractFactory("RewardsContract");
  const contract = await rewardsContract.deploy();

  // Test the initialize() function
  it("should initialize the contract with the correct values", async function () {
    expect(await contract.commitCounter()).to.equal(0);
    expect(await contract.stableToken()).to.be.equal(null);
  });

  // Test the commitTrees() function
  it("should create a new commit with the specified values", async function () {
    const budget = 1000;
    const owner = await ethers.provider.getSigner(0).getAddress();
    await contract.commitTrees(budget, owner);
    expect(await contract.commitCounter()).to.equal(1);
    const commit = await contract.commits(1);
    expect(commit.owner).to.equal(owner);
    expect(commit.budget).to.equal(budget);
    expect(commit.balance).to.equal(0);
    expect(commit.spent).to.equal(0);
  });

  // Test the setStableToken() function
  it("should set the stable token to the specified address", async function () {
    const stableTokenAddress = await ethers.provider.getSigner(1).getAddress();
    await contract.setStableToken(stableTokenAddress);
    expect(await contract.stableToken()).to.equal(stableTokenAddress);
  });

  // Test the frontPayout() function
  it("should send a payout to the specified address with the specified amount", async function () {
    const commitId = 1;
    const payoutAmount = 100;
    const timestamp = 1234567890;
    await contract.frontPayout(commitId, payoutAmount, timestamp);
    const commit = await contract.commits(commitId);
    expect(commit.spent).to.equal(payoutAmount);
    expect(commit.balance).to.equal(payoutAmount);
    const event = (await contract.queryFilter(contract.filters.PayoutSent()))[0];
    expect(event.args.recipient).to.equal(commit.owner);
    expect(event.args.timestamp).to.equal(timestamp);
    expect(event.args.payoutMetadataURL).to.be.empty();
    expect(event.args.front).to.be.true();
    expect(event.args.balance).to.equal(payoutAmount);
  });

  // Test the approvePayout() function
  it("should send a payout to the specified address with the specified amount, minus the current balance", async function () {
    const commitId = 1;
    const payoutAmount = 100;
    const timestamp = 1234567890;
    await contract.commitTrees(1000, await ethers.provider.getSigner(0).getAddress());
    await contract.frontPayout(commitId, 50, timestamp);
    await contract.approvePayout(commitId, 50, "", timestamp);
    const commit = await contract.commits(commitId);
    expect(commit.spent).to.equal(100);
    expect(commit.balance).to.equal(0);
    const event = (await contract.queryFilter(contract.filters.PayoutSent()))[1];
    expect(event.args.recipient).to.equal(commit.owner);
    expect(event.args.timestamp).to.equal(timestamp);
    expect(event.args.timestamp).to.equal(timestamp);
    expect(event.args.payoutMetadataURL).to.be.empty();
    expect(event.args.front).to.be.false();
    expect(event.args.balance).to.equal(0);
  });
});

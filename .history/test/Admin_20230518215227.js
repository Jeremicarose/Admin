const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RewardsContract", async function () {
  // Create a new instance of the contract
  const rewardsContract = await ethers.getContractFactory("RewardsContract");
  const contract = await rewardsContract.deploy();

  // Test the initialize() function
  it("should initialize the contract with the correct values", async function () {
    expect(contract.commitCounter()).to.equal(0);
    expect(contract.stableToken()).to.be.equal(null);
  });

  // Test the commitTrees() function
  it("should create a new commit with the specified values", async function () {
    const budget = 1000;
    const owner = ethers.accounts[0];
    await contract.commitTrees(budget, owner);
    expect(contract.commitCounter()).to.equal(1);
    expect(contract.commits[1].owner).to.equal(owner);
    expect(contract.commits[1].budget).to.equal(budget);
    expect(contract.commits[1].balance).to.equal(0);
    expect(contract.commits[1].spent).to.equal(0);
  });

  // Test the setStableToken() function
  it("should set the stable token to the specified address", async function () {
    const stableTokenAddress = ethers.accounts[1];
    await contract.setStableToken(stableTokenAddress);
    expect(contract.stableToken()).to.equal(stableTokenAddress);
  });

  // Test the frontPayout() function
  it("should send a payout to the specified address with the specified amount", async function () {
    const commitId = 1;
    const payoutAmount = 100;
    const timestamp = 1234567890;
    await contract.frontPayout(commitId, payoutAmount, timestamp);
    expect(contract.commits[commitId].spent).to.equal(payoutAmount);
    expect(contract.commits[commitId].balance).to.equal(payoutAmount);
    const event = await contract.PayoutSent({}, { fromBlock: timestamp, toBlock: "latest" });
    expect(event.args.recipient).to.equal(contract.commits[commitId].owner);
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
    await contract.commitTrees(1000, ethers.accounts[0]);
    await contract.frontPayout(commitId, 50, timestamp);
    await contract.approvePayout(commitId, 50, "", timestamp);
    expect(contract.commits[commitId].spent).to.equal(100);
    expect(contract.commits[commitId].balance).to.equal(0);
    const event = await contract.PayoutSent({}, { fromBlock: timestamp, toBlock: "latest" });
    expect(event.args.recipient).to.equal(contract.commits[commitId].owner);
    expect(event.args.timestamp).to.equal(timestamp);
    expect(event.args.payoutMetadataURL).to.be.empty();
    expect(event.args.front).to.be.false();
    expect(event.args.balance).to.equal(0);
  });
});

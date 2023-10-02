const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RewardsContract", async function () {
  // Create a new instance of the contract
  const rewardsContract = await ethers.getContractFactory("RewardsContract");
  console.log(rewardsContract)
  const contract = await rewardsContract.deploy();
  console.log(contract)

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

 
});

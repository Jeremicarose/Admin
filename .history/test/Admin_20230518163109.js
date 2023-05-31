const { expect } = require("chai");

describe("RewardsContract", function () {
  let RewardsContract;
  let rewardsContract;
  let deployer;
  let alice;

  beforeEach(async function () {
    RewardsContract = await ethers.getContractFactory("RewardsContract");
    [deployer, alice] = await ethers.getSigners();

    rewardsContract = await RewardsContract.deploy();
    await rewardsContract.initialize();
    await rewardsContract.grantRole(await rewardsContract.ADMIN_ROLE(), deployer.address);
    await rewardsContract.setStableToken(rewardsContract.address);
  });

  it("should commit trees", async function () {
    await rewardsContract.commitTrees(100, alice.address);

    const commit = await rewardsContract.commits(1);
    expect(commit.owner).to.equal(alice.address);
    expect(commit.number).to.equal(1);
    expect(commit.budget).to.equal(100);
    expect(commit.balance).to.equal(0);
    expect(commit.spent).to.equal(0);
  });

  it("should set stable token", async function () {
    const stableTokenAddress = ethers.constants.AddressZero;

    await rewardsContract.setStableToken(stableTokenAddress);
    const storedStableToken = await rewardsContract.stableToken();
    expect(storedStableToken).to.equal(stableTokenAddress);
  });

  it("should front payout", async function () {
    await rewardsContract.commitTrees(100, alice.address);

    await rewardsContract.frontPayout(1, 50, Math.floor(Date.now() / 1000));

    const commit = await rewardsContract.commits(1);
    expect(commit.spent).to.equal(50);
    expect(commit.balance).to.equal(50);
  });

  it("should approve payout", async function () {
    await rewardsContract.commitTrees(100, alice.address);

    await rewardsContract.approvePayout(1, 50, "", Math.floor(Date.now() / 1000));

    const commit = await rewardsContract.commits(1);
    expect(commit.spent).to.equal(50);
    expect(commit.balance).to.equal(50);
  });
});

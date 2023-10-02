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
    await rewardsContract.grantRole(
      await rewardsContract.DEFAULT_ADMIN_ROLE(),
      deployer.address
    );
    await rewardsContract.grantRole(
      await rewardsContract.ADMIN_ROLE(),
      deployer.address
    );
    await rewardsContract.setStableToken(rewardsContract.address);
  });

  it("should be able to commit trees", async function () {
    const budget = 100;
    const owner = alice.address;

    await rewardsContract.commitTrees(budget, owner);

    const commit = await rewardsContract.commits(1);

    expect(commit.owner).to.equal(owner);
    expect(commit.budget).to.equal(budget);
    expect(commit.balance).to.equal(0);
    expect(commit.spent).to.equal(0);
  });

  it("should be able to set the stable token", async function () {
    const stableToken = ethers.constants.AddressZero;

    await rewardsContract.setStableToken(stableToken);

    expect(await rewardsContract.stableToken()).to.equal(stableToken);
  });

  it("should only allow admins to front payouts", async function () {
    const commitId = 1;
    const payoutAmount = 10;
    const timestamp = 1234567890;

    await expect(
      rewardsContract.frontPayout(commitId, payoutAmount, timestamp)
    ).to.be.revertedWith("Caller is not an admin");
  });

  it("should be able to front payouts", async function () {
    const commitId = 1;
    const payoutAmount = 10;
    const timestamp = 1234567890;

    await rewardsContract.grantRole(
      await rewardsContract.ADMIN_ROLE(),
      deployer.address
    );

    await rewardsContract.frontPayout(commitId, payoutAmount, timestamp);

    const commit = await rewardsContract.commits(commitId);

    expect(commit.spent).to.equal(payoutAmount);
    expect(commit.balance).to.equal(payoutAmount);
  });

  it("should only allow admins to approve payouts", async function () {
    const commitId = 1;
    const payoutAmount = 10;
    const payoutMetadataURL = "https://example.com";
    const timestamp = 1234567890;

    await expect(
      rewardsContract.approvePayout(commitId, payoutAmount, payoutMetadataURL, timestamp)
    ).to.be.revertedWith("Caller is not an admin");
  });

  it("should be able to approve payouts", async function () {
    const commitId = 1;
    const payoutAmount = 10;
    const payoutMetadataURL = "https://example.com";
    const timestamp = 1234567890;

    await rewardsContract.grantRole(
      await rewardsContract.ADMIN_ROLE(),
      deployer.address
    );

    await rewardsContract.approvePayout(commitId, payoutAmount, payoutMetadataURL, timestamp);

    const commit = await rewardsContract.commits(commitId);

    expect(commit.spent).to.equal(payoutAmount);
    expect(commit.balance).to.equal(0);
  });
});

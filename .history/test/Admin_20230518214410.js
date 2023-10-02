const { expect } = require("chai");
const web3 = require("web3");
const { PublicKey } = web3.PublicKey;

const ADMIN_ROLE = "ADMIN_ROLE";

describe("RewardsContract", () => {
  let connection;
  let contract;

  beforeEach(async () => {
    connection = new web3.Connection(
      "wss://ropsten.infura.io/ws/v3/<YOUR_INFURA_PROJECT_ID>",
      "latest"
    );
    contract = await new web3.Contract(RewardsContract.info.abiDefinition, new PublicKey("0x5555555555555555555555555555555555555555"), connection);
  });

  afterEach(() => {
    await connection.disconnect();
  });

  it("should be able to commit trees", async () => {
    const budget = 100 ether;
    const owner = web3.Keypair.generate().publicKey;

    await contract.commitTrees(budget, owner);

    const commit = await contract.commits(1);

    expect(commit.owner).to.equal(owner);
    expect(commit.budget).to.equal(budget);
    expect(commit.balance).to.equal(0);
    expect(commit.spent).to.equal(0);
  });

  it("should be able to set the stable token", async () => {
    const stableToken = web3.Keypair.generate().publicKey;

    await contract.setStableToken(stableToken);

    expect(contract.stableToken).to.equal(stableToken);
  });

  it("should only allow admins to front payouts", async () => {
    const commitId = 1;
    const payoutAmount = 10 ether;
    const timestamp = 1234567890;

    await expect(
      contract.frontPayout(commitId, payoutAmount, timestamp)
    ).to.be.revertedWith("Caller is not an admin");
  });

  it("should be able to front payouts", async () => {
    const commitId = 1;
    const payoutAmount = 10 ether;
    const timestamp = 1234567890;

    await contract.grantRole(ADMIN_ROLE, web3.Keypair.generate().publicKey);

    await contract.frontPayout(commitId, payoutAmount, timestamp);

    const commit = await contract.commits(commitId);

    expect(commit.spent).to.equal(payoutAmount);
    expect(commit.balance).to.equal(payoutAmount);
  });

  it("should only allow admins to approve payouts", async () => {
    const commitId = 1;
    const payoutAmount = 10 ether;
    const payoutMetadataURL = "https://example.com";
    const timestamp = 1234567890;

    await expect(
      contract.approvePayout(commitId, payoutAmount, payoutMetadataURL, timestamp)
    ).to.be.revertedWith("Caller is not an admin");
  });

  it("should be able to approve payouts", async () => {
    const commitId = 1;
    const payoutAmount = 10 ether;
    const payoutMetadataURL = "https://example.com";
    const timestamp = 1234567890;

    await contract.grantRole(ADMIN_ROLE, web3.Keypair.generate().publicKey);

    await contract.approvePayout(commitId, payoutAmount, payoutMetadataURL, timestamp);

    const commit = await contract.commits(commitId);

    expect(commit.spent).to.equal(payoutAmount);
    expect(commit.balance).to.equal(0);
  });
});
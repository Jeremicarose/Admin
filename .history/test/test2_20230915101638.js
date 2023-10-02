const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Admin', function () {
  let Admin, admin, owner, addr1, addr2;
  let ownerAddress, addr1Address;
  const budget = 50;

  let StableToken, stableToken;

beforeEach(async () => {
    Admin = await ethers.getContractFactory('Admin');
    StableToken = await ethers.getContractFactory('MockStableTpken'); // replace 'StableToken' with the name of your token contract
    [owner, addr1, addr2] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();

    // Deploy a new Admin contract for each test
    admin = await Admin.deploy();
    await admin.deployed();

    // Deploy a new StableToken contract for each test
    stableToken = await StableToken.deploy(); // add constructor arguments if necessary
    await stableToken.deployed();

    // Call initialize function after deployment
    await admin.initialize(stableToken.address);
});



  it('should correctly handle payouts and debts', async function () {
    const timestamp = Math.floor(Date.now() / 1000);

    // Create a commit with a budget of 50
    await admin.commitTree(ownerAddress, budget, 1, timestamp);

    // Front a payout of 20, check that debt increased
    await admin.frontPayout(1, 20, timestamp);
    let debt = await admin.getUserBalance(ownerAddress);
    expect(debt).to.equal(20);

    // Approve a payout of 15, check that debt decreased and no cUSD has been sent
    await admin.approvePayout(1, 15, "metadata", timestamp);
    debt = await admin.getUserBalance(ownerAddress);
    expect(debt).to.equal(5);

    // Approve a payout of 10, check that debt has zeroed and a cUSD transfer happened, but the value should not be 10
    await admin.approvePayout(1, 10, "metadata", timestamp);
    debt = await admin.getUserBalance(ownerAddress);
    expect(debt).to.equal(0);

    // Approve a payout of 10, check that debt remain zero and a cUSD transfer happened, the value should be 10
    await admin.approvePayout(1, 10, "metadata", timestamp);
    debt = await admin.getUserBalance(ownerAddress);
    expect(debt).to.equal(0);
  });
});

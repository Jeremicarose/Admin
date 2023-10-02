const { expect } = require('chai');

describe('TestAdmin', function () {
  let testAdmin;

  before(async function () {
    const TestAdmin = await ethers.getContractFactory('TestAdmin');
    const stableTokenAddress = 'YOUR_STABLETOKEN_ADDRESS';
    testAdmin = await TestAdmin.deploy(stableTokenAddress);
    await testAdmin.deployed();
  });

  it('Should deploy the TestAdmin contract', async function () {
    expect(testAdmin.address).to.not.be.undefined;
    expect(await testAdmin.owner()).to.equal(await ethers.getSigner().getAddress());
  });
});
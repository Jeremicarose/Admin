const { expect } = require('chai');

describe('TestAdmin', function () {
  let testAdmin;

  before(async function () {
    const TestAdmin = await ethers.getContractFactory('TestAdmin');
    testAdmin = await TestAdmin.deploy('YOUR_STABLETOKEN_ADDRESS');
    await testAdmin.deployed();
  });

  it('Should deploy the TestAdmin contract', async function () {
    expect(testAdmin.address).to.not.be.undefined;
    expect(await testAdmin.owner()).to.equal(await ethers.getSigner().getAddress());
  });
});

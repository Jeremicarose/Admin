const { expect } = require('chai');

describe('TestAdmin', function () {
  let testAdmin;

  before(async function () {
    const TestAdmin = await ethers.getContractFactory('TestAdmin');
     testAdmin = await upgrades.deployProxy(TestAdmin, ["0x2e81a0F09E79aCE2312147fB391604645DC4D826"], { initializer: 'initialize' });
    await testAdmin.deployed();
    
  });

  it('Should deploy the TestAdmin contract', async function () {
    expect(testAdmin.address).to.not.be.undefined;
    expect(await testAdmin.owner()).to.equal(await ethers.getSigner().getAddress());
  });
});
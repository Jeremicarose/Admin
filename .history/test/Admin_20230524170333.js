const { expect } = require('chai');

describe('TestAdmin', function () {
  let testAdmin;

  before(async function () {
    const TestAdmin = await ethers.getContractFactory('TestAdmin');
    const stableTokenAddress = '0x874069fa1eb16d44d622f2e0ca25eea172369bc1';
    testAdmin = await TestAdmin.deploy(stableTokenAddress);
    await testAdmin.deployed();
  });

  it('Should deploy the TestAdmin contract', async function () {
    expect(testAdmin.address).to.not.be.undefined;
    expect(await testAdmin.owner()).to.equal(await ethers.getSigner().getAddress());
  });
});
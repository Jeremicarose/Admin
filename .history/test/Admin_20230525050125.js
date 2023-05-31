const { expect } = require('chai');

describe('TestAdmin', function () {
  let testAdmin;

  before(async function () {
    const TestAdmin = await ethers.getContractFactory('TestAdmin');
    testAdmin = await TestAdmin.new();
    
  });

  it('Should deploy the TestAdmin contract', async function () {
    expect(testAdmin.address).to.not.be.undefined;
    expect(await testAdmin.owner()).to.equal(await ethers.getSigner().getAddress());
  });
});
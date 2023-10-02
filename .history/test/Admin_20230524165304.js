const { expect } = require('chai');

describe("TestAdmin", () => {
  it("should be deployed correctly", async () => {
    // Deploy the contract
    const testAdmin = await TestAdmin.deployed();

    // Assert that the contract was deployed correctly
    expect(testAdmin.address).toBeDefined();
    expect(testAdmin.isOwner(eth.accounts[0])).toBeTrue();
  });
});
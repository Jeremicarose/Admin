const { TestAdmin } = require("contracts/Admin.sol");

async function main() {
  const provider = new ethers.providers.HttpProvider("https://alfajores-faucet.celo-testnet.org");
  const TestAdmin = await ethers.getContractFactory("TestAdmin");
  const testAdmin = await TestAdmin.deploy(provider);
  await testAdmin.deployed();

  console.log("The address of the deployed contract is:", testAdmin.address);
}

main().catch(console.error);

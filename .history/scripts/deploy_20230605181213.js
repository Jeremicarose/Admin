const { ethers } = require("hardhat");

async function main() {
  const provider = new ethers.providers.JsonRpcProvider("https://alfajores-faucet.celo-testnet.org");
  const Admin = await ethers.getContractFactory("Admin");
  const admin = await Admin.deploy(provider);
  await admin.deployed();

  console.log("The address of the deployed contract is:", admin.address);
}

// Define the deploy task
task("deploy", "Deploys the Admin contract")
  .setAction(async (taskArgs, hre) => {
    await hre.run("compile");
    await main();
  });

// Run the deploy task
module.exports = async function () {
  try {
    await run("deploy");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

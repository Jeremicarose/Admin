const { ethers } = require("hardhat");

async function main() {
  const provider = new ethers.providers.JsonRpcProvider("https://alfajores-faucet.celo-testnet.org");
  const Admin = await ethers.getContractFactory("Admin");
  const admin = await Admin.deploy(provider);
  await admin.deployed();

  console.log("The address of the deployed contract is:", admin.address);
}

main().catch(console.error);

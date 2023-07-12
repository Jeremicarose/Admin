const { ethers, upgrades } = require("hardhat");

async function main() {
   const gas = await ethers.provider.getGasPrice()
   const AdminContract = await ethers.getContractFactory("Admin");
   console.log("Deploying Admin contract...");

   // Add your stable token address here.
   let stableTokenAddress = '0x...';

   const adminContract = await upgrades.deployProxy(AdminContract, [stableTokenAddress], {
      gasPrice: gas, 
      initializer: "initialize",
   });
   await adminContract.deployed();
   console.log("Admin contract deployed to:", adminContract.address);
}

main().catch((error) => {
   console.error(error);
   process.exitCode = 1;
});

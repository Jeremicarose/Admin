const { ethers, upgrades } = require("hardhat");

async function main() {
   const gas = await ethers.provider.getGasPrice()
   const AdminContract = await ethers.getContractFactory("Admin");
   console.log("Deploying Admin contract...");

   // Add your stable token address here.
   let stableTokenAddress = '0x765de816845861e75a25fca122bb6898b8b1282a';
   let stableTokenAddress2= '0x090d05B695DeA1A3e57b4C7baC8d4D9EaE25bC6F';

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
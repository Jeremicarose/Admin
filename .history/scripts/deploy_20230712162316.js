// async function main() {
//   // Deploying the smart contract
//   const MyContract = await ethers.getContractFactory("Admin");
//   const myContract = await MyContract.deploy();

//   // Waiting for the contract to be deployed
//   await myContract.deployed();

//   console.log("MyContract deployed to:", myContract.address);


// }

const { ethers, upgrades } = require("hardhat");

async function main() {
   const gas = await ethers.provider.getGasPrice()
   const AdminContract = await ethers.getContractFactory("Admin");
   console.log("Deploying Admin contract...");
   const adminContract = await upgrades.deployProxy(AdminContract, ['0x874069fa1eb16d44d622f2e0ca25eea172369bc1'], {
      gasPrice: gas, 
      initializer: "initialvalue",
   });
   await adminContract.deployed();
   console.log("Admin contract deployed to:", adminContract.address);
}

main().catch((error) => {
   console.error(error);
   process.exitCode = 1;
});



// Running the deployment script
// main()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   }); 

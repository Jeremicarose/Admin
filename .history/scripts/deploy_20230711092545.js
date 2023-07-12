// async function main() {
//   // Deploying the smart contract
//   const MyContract = await ethers.getContractFactory("Admin");
//   const myContract = await MyContract.deploy();

//   // Waiting for the contract to be deployed
//   await myContract.deployed();

//   console.log("MyContract deployed to:", myContract.address);


// }

module.exports = async ({getNamedAccounts, deployments}) => {
  const {deploy} = deployments;
  const {deployer} = await getNamedAccounts();
  await deploy('Admin', {
    from: deployer,
    args: ['0x874069fa1eb16d44d622f2e0ca25eea172369bc1'],
    log: true,
  });
};
module.exports.tags = ['Admin'];

// Running the deployment script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 

const { ethers, deployments } = require("hardhat");

async function main() {
  // Retrieve the deployment parameters
  const { deploy } = deployments;
  const [deployer] = await ethers.getSigners();

  // Deploy the smart contract
  const deployment = await deploy("Admin", {
    from: deployer.address,
    args: ['0x874069fa1eb16d44d622f2e0ca25eea172369bc1'],
    log: true,
    network: "alfajores", // Specify the network to deploy to (e.g., "alfajores", "mainnet")
  });

  // Print the contract address and deployment information
  console.log("Contract deployed to:", deployment.address);
  console.log("Transaction hash:", deployment.transactionHash);
}

// Run the deployment script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
});

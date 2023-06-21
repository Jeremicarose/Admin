async function main() {
  // Deploying the smart contract
  const MyContract = await ethers.getContractFactory("Admin");
  const myContract = await MyContract.deploy();

  // Waiting for the contract to be deployed
  await myContract.deployed();

  console.log("MyContract deployed to:", myContract.address);

  // Accessing the admin address
  const admin = await myContract.getAdmin();
  console.log("Admin address:", admin);
}

// Running the deployment script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

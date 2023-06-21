module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const contractAddress = await deploy('Admin', {
    from: deployer,
  });

  tasks: {
    deploy: {
      // This task will deploy the Admin contract to the Alfajores testnet.
      // The contract address will be logged to the console.
      run: (deployer, network, accounts) => {
        const Admin = artifacts.require("./contracts/Admin.sol");
        const admin = await deployer.deploy(Admin);
        console.log("Contract address:", admin.address);
      },
    },
  },
  console.log('Contract address:', contractAddress);
};
module.exports.tags = ['Admin'];

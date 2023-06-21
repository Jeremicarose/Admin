module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const contractAddress = await deploy('Admin', {
    from: deployer,
  });
  console.log('Contract address:', contractAddress);
};
module.exports.tags = ['Admin'];

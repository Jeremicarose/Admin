module.exports = async ({ ethers, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await ethers.getNamedSigners();

  const deployment = await deploy('Admin', {
    from: deployer.address,
    args: ['0x874069fa1eb16d44d622f2e0ca25eea172369bc1'],
    log: true,
  });

  if (deployment.newlyDeployed) {
    console.log('Admin deployed to:', deployment.address);
  }
};
module.exports.tags = ['Admin'];

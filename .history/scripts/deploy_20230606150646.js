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
module.exports = async ({getNamedAccounts, deployments}) => {
   const {deploy} = deployments;
   const {deployer} = await getNamedAccounts();
   await deploy('Admin', {
     from: deployer,
     args: ['0x874069fa1eb16d44d622f2e0ca25eea172369bc1'],
     log: true,
   });
 };
 console.log("Deploying Admin contract");
 console.log("Deployed Admin contract" + Admin);
 module.exports.tags = ['Admin'];
const Admin = artifacts.require("Admin");

async function main() {
  const provider = await getAlfajoresProvider();
  const network = await web3.eth.getNetwork("alfajores");

  const admin = await Admin.deploy(provider, network);

  console.log("Admin deployed to address:", admin.address);
}

main().catch(console.error);
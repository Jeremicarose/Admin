const Admin = artifacts.require("Admin");

function getAlfajoresProvider() {
  const providerUrl = "https://alfajores-faucet.celo-testnet.org";
  return new ethers.providers.JsonRpcProvider(providerUrl);
}

async function main() {
  const provider = await getAlfajoresProvider();
  const network = await web3.eth.getNetwork("alfajores");

  const admin = await Admin.deploy(provider, network);

  console.log("Admin deployed to address:", admin.address);
}

main().catch(console.error);
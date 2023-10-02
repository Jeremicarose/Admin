import etherscan from "etherscan-api";

const contractAddress = "0x0d8C8942994d92f30ed2357bD4Cd83bF36F4Ae54";
const contractABI = "...";

const client = etherscan.createClient({
  apiKey: "YOUR_ETHERSCAN_API_KEY",
});

const result = await client.verifyContract(contractAddress, contractABI);

console.log(result);

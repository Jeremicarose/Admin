verify.mjs
import { createClient } from "etherscan-api";

async function verifyContract() {
const contractAddress = "0x0d8C8942994d92f30ed2357bD4Cd83bF36F4Ae54";
const contractABI = require("./artifacts/contracts/Admin.sol/Admin.json");
const etherscanApiKey = process.env.ETHERSCAN_API_KEY;

const client = createClient({
  apiKey: etherscanApiKey,
});

const result = await client.verifyContract(contractAddress, contractABI);

console.log(result);
}

verifyContract();

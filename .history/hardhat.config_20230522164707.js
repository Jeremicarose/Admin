require("@nomiclabs/hardhat-ethers");
require("dotenv").config({path: ".env"});



const CELO_RPC_URL = process.env.CELO_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;


module.exports = {
  solidity: {
    version: "0.8.0",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    artifacts: "./artifacts",
  },
  networks: {
    alfajores: {
      url: CELO_RPC_URL,
      accounts: [PRIVATE_KEY]
    },
  }
}
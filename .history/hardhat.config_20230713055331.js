require("@nomiclabs/hardhat-etherscan");
require("dotenv").config({ path: ".env" });
require("@nomiclabs/hardhat-truffle5");
require("@nomiclabs/hardhat-waffle");
require("@openzeppelin/hardhat-upgrades");
require("hardhat-gas-reporter");
require('hardhat-deploy');

const CELO_RPC_URL = process.env.CELO_RPC_URL;
const etherscanApiKey = process.env.ETHERSCAN_API_KEY;
//Deploy address = 0xE17C22430047B63b5051cb0B182498a8d4FBFf3a

module.exports = {
  solidity: "0.8.16",
  networks: {
    hardhat: {
      blockGasLimit: 10000000,
      allowUnlimitedContractSize: false,
    },
    alfajores: {
      url: CELO_RPC_URL,
      accounts: {
        mnemonic: process.env.PRIVATE_KEY,
        path: "m/44'/52752'/0'/0"
      },
      chainId: 44787,
      gasPrice: 5000000000,
      gas: 8000000,
    },
  },
  etherscan: {
    apiKey: etherscanApiKey,
    url: "https://api.etherscan.io/api",
    customChains: [
      {
        network: "alfajores",
        chainId: 44787,
        urls: {
          apiURL: "https://api-testnet.celoexplorer.org/api",
          browserURL: "https://testnet.celoexplorer.org",
        },
      },
    ],
  },
  gasReporter: {
    currency: "USD",
  },
};

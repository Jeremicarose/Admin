require("@nomiclabs/hardhat-ethers");
require("dotenv").config({ path: ".env" });
require("@nomiclabs/hardhat-truffle5");
require("@nomiclabs/hardhat-waffle");
require("@openzeppelin/hardhat-upgrades");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-gas-reporter");

const CELO_RPC_URL = process.env.CELO_RPC_URL;
const etherscanApiKey = "<YOUR_ETHERSCAN_API_KEY>";

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
    chainId: 44787
  },
  },
  gasReporter: {
    currency: "USD",
  },
};

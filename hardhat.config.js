require("@nomiclabs/hardhat-ethers");
require("dotenv").config({path: ".env"});
require('@nomiclabs/hardhat-truffle5');
require("@nomiclabs/hardhat-waffle");
require("@openzeppelin/hardhat-upgrades");
require("hardhat-gas-reporter");
require('hardhat-deploy');

const CELO_RPC_URL = process.env.CELO_RPC_URL;


/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.16",
  networks: {
    hardhat: {
      blockGasLimit: 10000000,
      allowUnlimitedContractSize: false,
    },
    alfajores: {
      url: CELO_RPC_URL,
      accounts: [],
      url: "https://alfajores-forno.celo-testnet.org",
      accounts: []
    },
    celo: {
      url: "https://forno.celo.org",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 42220,
  },
  },
  gasReporter: {
    currency: "USD",
  }
}
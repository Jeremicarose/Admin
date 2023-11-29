
require("dotenv").config({ path: ".env" });
require("@nomiclabs/hardhat-truffle5");
require("@nomiclabs/hardhat-waffle");
require("@openzeppelin/hardhat-upgrades");
require("hardhat-gas-reporter");
require('hardhat-deploy');

const CELO_RPC_URL = process.env.CELO_RPC_URL;


/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.2",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
      1: "",  // enter the wallet address of the one that will deploy the contract
    }
  },
  networks: {
    hardhat: {
      blockGasLimit: 10000000,
      allowUnlimitedContractSize: false,
    },
    alfajores: {
      url: "https://alfajores-forno.celo-testnet.org",
      accounts: ["51316d1b99a418519259f85a5c124747414025bfa92e8defae4a8925a1cff1c3"],  // enter private key of the one that will deploy the contract to testnet
      //chainId: 44787
    }
  },
  gasReporter: {
    currency: "USD",
  },
};
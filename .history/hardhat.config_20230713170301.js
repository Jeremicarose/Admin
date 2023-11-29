require('@nomiclabs/hardhat-truffle5');
require("@nomiclabs/hardhat-waffle");
require('hardhat-deploy');
require("hardhat-gas-reporter");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.1",
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
      accounts: [""],  // enter private key of the one that will deploy the contract to testnet
      //chainId: 44787
    }
  },
  gasReporter: {
    currency: "USD",
  },
};
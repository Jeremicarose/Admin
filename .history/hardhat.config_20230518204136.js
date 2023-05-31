import "@nomiclabs/hardhat-ethers";
require("dotenv").config({path: ".env"});
require("hardhat-tracer");



module.exports = {
  solidity: "0.8.16",
  networks: {
    alfajores: {
      url: "https://alfajores-forno.celo-testnet.org",
      accounts: {
        mnemonic: process.env.MNEMONIC, // line 25
        path: "m/44'/60'/0'/0", // line 26
      },
      chainId: 44787,
    },
  },
};
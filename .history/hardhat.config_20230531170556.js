require("@nomiclabs/hardhat-ethers");
require("dotenv").config({path: ".env"});
require('@nomiclabs/hardhat-truffle5');
require("@nomiclabs/hardhat-waffle");
require("@openzeppelin/hardhat-upgrades");





const CELO_RPC_URL = process.env.CELO_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;


module.exports = {
  solidity: "0.8.16",
  networks: {
    alfajores: {
      url: CELO_RPC_URL,
      accounts: []
    },
  }
}
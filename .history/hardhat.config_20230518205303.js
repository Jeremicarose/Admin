require("@nomiclabs/hardhat-waffle");
require("dotenv").config({ path: ".env" });



module.exports = {
  solidity: "0.8.16",
  networks: {
    alfajores: {
      url: "https://alfajores-forno.celo-testnet.org",
      accounts: {
        mnemonic: process.env.MNEMONIC, // line 25
        path: "m/44'/52752'/0'/0", // line 26
      },
      chainId: 44787,
    },
  },
};
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "testnet",
  networks: {
  	localhost: {
      url: "http://127.0.0.1:8545"
    },
    hardhat: {
    },
    testnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      gasPrice: 60000000000,
      accounts: ['49ee088b9bcda1b6b8f8cde688193e67bbbc41602deeef0454bd838b3f414cb7']
    },
    mainnet: {
      url: "https://bsc-dataseed.binance.org/",
      chainId: 56,
      gasPrice: 10000000000,
      accounts: ['49ee088b9bcda1b6b8f8cde688193e67bbbc41602deeef0454bd838b3f414cb7']
    }
  },
  solidity: "0.8.9",
};

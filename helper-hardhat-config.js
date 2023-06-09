const { ethers } = require("hardhat");
const networkConfig = {
  11155111: {
    name: "sepolia",
    vrfCoordinatorV2: "0x8103B0A8A00be2DDC7­78e6e7eaa21791Cd3646­25", // The vrfCoordinatorV2Addess on the Sepolia testnet goes here
    gasLane:
      "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
    subscriptionId: "0",
    callbackGasLimit: "500000",
    leastEthToSend: ethers.utils.parseEther("0.01"),
    randomNumberRange: "10",
    numberOfTrials: "3",
    value: ethers.utils.parseEther("5"),
  },
  31337: {
    name: "hardhat",
    gasLane:
      "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
    callbackGasLimit: "500000",
    leastEthToSend: ethers.utils.parseEther("0.1"),
    randomNumberRange: "10",
    numberOfTrials: "3",
    value: ethers.utils.parseEther("5"),
  },
  1337: {
    name: "ganache",
    gasLane:
      "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
    callbackGasLimit: "500000",
    leastEthToSend: ethers.utils.parseEther("0.1"),
    randomNumberRange: "10",
    numberOfTrials: "3",
    value: ethers.utils.parseEther("5"),
  },
};
const developmentChains = ["localhost", "hardhat", "ganache"];
const FRONT_END_ADDRESSES_FILE = "../Client/src/utils/address.json";
const FRONT_END_ABI_FILE = "../Client/src/utils/abi.json";

module.exports = {
  networkConfig,
  developmentChains,
  FRONT_END_ADDRESSES_FILE,
  FRONT_END_ABI_FILE,
};

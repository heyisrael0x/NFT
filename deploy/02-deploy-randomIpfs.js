const { network, ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");
const { storeImages } = require("../utils/uploadToPinata");
require("dotenv").config();

const imagesLocation = "./images/randomIpfsNft";
const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("30");
module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  let tokenUris;

  if (process.env.UPLOAD_TO_PINATA) {
    tokenUris = await handleTokenUris();
  }

  let vrfCoordinatorV2Address, subscriptionId;
  if (developmentChains.includes(network.name)) {
    const vrfCoordinatorV2Mock = await ethers.getContract(
      "VRFCoordinatorV2Mock"
    );
    vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
    const txResponse = await vrfCoordinatorV2Mock.createSubscription();
    const txReceipt = await txResponse.wait(1);
    subscriptionId = txReceipt.events[0].args.subId;
    await vrfCoordinatorV2Mock.fundSubscription(
      subscriptionId,
      VRF_SUB_FUND_AMOUNT
    );
  } else {
    vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"];
    subscriptionId = networkConfig[chainId]["subscriptionId"];
  }

  const gasLane = networkConfig[chainId]["gasLane"];
  const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"];
  const mintFee = networkConfig[chainId]["mintFee"];

  await storeImages(imagesLocation);

  const args = [
    vrfCoordinatorV2Address,
    subscriptionId,
    gasLane,
    callbackGasLimit,
    tokenUris,
    mintFee,
  ];

  //   const randomipfsNft = await deploy("RandomIpfsNft", {
  //     from: deployer,
  //     log: true,
  //     args: args,
  //     waitConfirmations: network.config.blockConfirmations,
  //   });
};

async function handleTokenUris() {
  tokenUris = [];
  // Store the image in ipfs
  // Store metadata to ipfs

  return tokenUris;
}
module.exports.tags = ["all", "randomipfs", "main"];

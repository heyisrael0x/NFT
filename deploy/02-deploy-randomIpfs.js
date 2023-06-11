const { network, ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");
const {
  storeImages,
  storeTokenUriMetadata,
} = require("../utils/uploadToPinata");
require("dotenv").config();

const imagesLocation = "./images/randomIpfsNft";

const metadataTemplate = {
  name: "",
  description: "",
  image: "",
  attributes: {
    trait_type: "Braveness",
    value: 100,
  },
};

const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("30");
module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  let tokenUris = [];

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

  const args = [
    vrfCoordinatorV2Address,
    subscriptionId,
    gasLane,
    callbackGasLimit,
    tokenUris,
    mintFee,
  ];

  const randomipfsNft = await deploy("RandomIpfsNft", {
    from: deployer,
    log: true,
    args: args,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  log("randomipfsNft is", randomipfsNft.address);

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("verify.....");
    await verify(basicNft.address, args);
    log("--------------------------");
  } else {
    log("On a develpoment-chain not verifing");
  }
};

async function handleTokenUris() {
  tokenUris = [];
  // Store the image in ipfs
  // Store metadata to ipfs
  const { responses: imageUploadResponses, files } = await storeImages(
    imagesLocation
  );
  for (imageUploadResponseIndex in imageUploadResponses) {
    // Create Metadata
    // Upload Metadata
    let tokenUriMetadata = { ...metadataTemplate };
    tokenUriMetadata.name = files[imageUploadResponseIndex].replace(".jpg", "");
    tokenUriMetadata.description = `A brave ${tokenUriMetadata.name}`;
    tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].ipfsHash}`;
    console.log(`Uploading ${tokenUriMetadata.name}..`);

    // Store the json to pinata/ IPFS
    const metadataUploadResponse = await storeTokenUriMetadata(
      tokenUriMetadata
    );
    tokenUris.push(`ipfs://${metadataUploadResponse.ipfsHash}`);
  }
  console.log("Token URIS uploaded!, They are:");
  console.log(tokenUris);
  return tokenUris;
}

module.exports.tags = ["all", "randomipfs", "main"];

const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const { assert } = require("chai");
const {
  developmentChains,
} = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Basic NFT unit test", () => {
      let basicNft, deployer;

      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        console.log(deployer)
        await deployments.fixture("basicNft");
        basicNft = await ethers.getContract("BasicNft", deployer);
        console.log(basicNft)
      });
      it("Allows users to mint an NFT, and updates appropriately", async () => {
        console.log(deployer)
        console.log(basicNft)
        const txResponse = await basicNft.mintNft();
        await txResponse.wait(1);
        const tokenURI = await basicNft.tokenURI(0);
        const tokenCounter = await basicNft.getTokenCounter();

        assert.equal(tokenCounter.toString(), "1");
        assert.equal(tokenURI, await basicNft.TOKEN_URI);
      });
    });

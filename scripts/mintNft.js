const { ethers } = require("hardhat");

async function mintNft() {
  const basicNft = await ethers.getContract("BasicNft");
  console.log(basicNft.address);
  for (let index = 0; index < 2; index++) {
    basicNft.mintNft();
  }
  // await txResponse.wait(1);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
mintNft().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

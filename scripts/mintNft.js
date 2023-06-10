const { ethers } = require("hardhat");
require("dotenv").config()


async function mintNft() {

  console.log(process.env.PINATA_API_KEY)

  // const basicNft = await ethers.getContract("BasicNft");
  // console.log(basicNft.address);
  // for (let index = 0; index < 2; index++) {
  //   basicNft.mintNft();
  // }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
mintNft().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

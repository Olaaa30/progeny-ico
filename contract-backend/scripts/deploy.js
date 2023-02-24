const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });
const { STAKED_PUNKS_NFT_CONTRACT_ADDRESS } = require("../constants/constants");

async function main() {
  const stakedPunksNFTContract = STAKED_PUNKS_NFT_CONTRACT_ADDRESS;

  const stakedPunksTokenContract = await ethers.getContractFactory(
    "StakedPunkToken"
  );
  const deployedStakedPunksTokenContract =
    await stakedPunksTokenContract.deploy(stakedPunksNFTContract);
}
await deployedStakedPunksTokenContract.deployed();
console.log(
  "Staked Punks Token Contract address: " +
    deployedStakedPunksTokenContract.address
);
//call main function and catch any errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });

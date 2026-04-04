const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const { ethers } = hre;
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");

  if (balance < ethers.parseEther("0.01")) {
    throw new Error("Insufficient ETH. Need at least 0.01 Sepolia ETH.");
  }

  const PrivateVoting = await ethers.getContractFactory("PrivateVoting");
  console.log("Deploying PrivateVoting...");

  // Deploy with deployer as the initial gateway (we control fulfillTally in V1 mock)
  const voting = await PrivateVoting.deploy(deployer.address);
  await voting.waitForDeployment();
  const votingAddress = await voting.getAddress();
  console.log("PrivateVoting deployed at:", votingAddress);

  const deployments = {
    network: "sepolia",
    chainId: 11155111,
    PrivateVoting: votingAddress,
    gateway: deployer.address,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    transactions: {}
  };

  fs.writeFileSync("deployments.json", JSON.stringify(deployments, null, 2));
  console.log("Saved deployments.json");
  console.log("View on Etherscan: https://sepolia.etherscan.io/address/" + votingAddress);
}

main().catch((e) => { console.error(e); process.exit(1); });

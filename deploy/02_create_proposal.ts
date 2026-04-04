const hre = require("hardhat");
const deployments = require("../deployments.json");

async function main() {
  const { ethers } = hre;
  const PrivateVoting = await ethers.getContractAt("PrivateVoting", deployments.PrivateVoting);
  
  // Proposal ID 1 is already in our demo UI
  const proposalId = 1;
  console.log(`Creating proposal #${proposalId} on Sepolia...`);
  
  const tx = await PrivateVoting.createProposal(proposalId);
  console.log("TX Hash:", tx.hash);
  await tx.wait();
  console.log("Proposal created successfully.");
}

main().catch((e) => { console.error(e); process.exit(1); });

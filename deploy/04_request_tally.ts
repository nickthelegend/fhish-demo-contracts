const hre = require("hardhat");
const deployments = require("../deployments.json");

async function main() {
  const { ethers } = hre;
  const PrivateVoting = await ethers.getContractAt("PrivateVoting", deployments.PrivateVoting);
  
  const proposalId = 1;
  console.log(`Requesting tally reveal for proposal #${proposalId}...`);
  
  const tx = await PrivateVoting.requestTallyReveal(proposalId);
  console.log("TX Hash:", tx.hash);
  await tx.wait();
  console.log("Reveal request submitted. Relayer should process it shortly.");
}

main().catch((e) => { console.error(e); process.exit(1); });

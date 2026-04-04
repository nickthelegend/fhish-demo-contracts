const hre = require("hardhat");
const deployments = require("../deployments.json");

async function main() {
  const { ethers } = hre;
  const PrivateVoting = await ethers.getContractAt("PrivateVoting", deployments.PrivateVoting);
  
  const proposalId = 1;
  const status = await PrivateVoting.getProposalStatus(proposalId);
  console.log("Proposal Status:");
  console.log("  Active:  ", status[0]);
  console.log("  Revealed:", status[1]);
  console.log("  YES:     ", status[2].toString());
  console.log("  NO:      ", status[3].toString());
}

main().catch((e) => { console.error(e); process.exit(1); });

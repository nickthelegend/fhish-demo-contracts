const hre = require("hardhat");
const deployments = require("../deployments.json");

async function main() {
  const { ethers } = hre;
  const PrivateVoting = await ethers.getContractAt("PrivateVoting", deployments.PrivateVoting);
  
  const proposalId = 1;
  const encryptedVote = ethers.toUtf8Bytes("placeholder_encrypted_vote_yes");
  const voteChoice = true;
  
  console.log(`Casting vote on proposal #${proposalId}...`);
  const tx = await PrivateVoting.castVote(proposalId, encryptedVote, voteChoice);
  console.log("TX Hash:", tx.hash);
  await tx.wait();
  console.log("Vote cast successfully.");
}

main().catch((e) => { console.error(e); process.exit(1); });

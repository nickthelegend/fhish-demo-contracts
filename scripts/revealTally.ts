import { ethers } from "hardhat";
import * as fs from "fs";

async function main() {
  const depl = JSON.parse(fs.readFileSync("deployments.json", "utf8"));
  const voting = await ethers.getContractAt("PrivateVoting", depl.PrivateVoting);
  
  console.log("Requesting tally reveal...");
  const tx = await voting.requestTallyReveal(1);
  await tx.wait();
  console.log("Tally reveal requested, waiting for relayer...");

  return new Promise((resolve) => {
    voting.on("ProposalResult", (proposalId, yesVotes, noVotes, passed) => {
      console.log(`Proposal ${proposalId} result: YES=${yesVotes} NO=${noVotes} PASSED=${passed}`);
      resolve(true);
    });

    setTimeout(async () => {
      const status = await voting.getProposalStatus(1);
      if (status.revealed) {
        console.log(`Proposal 1 result: YES=${status.yesVotes} NO=${status.noVotes} PASSED=${status.yesVotes > status.noVotes}`);
      } else {
        console.log("Timeout waiting for relayer (60s). Maybe relayer is not running?");
      }
      resolve(false);
    }, 60000);
  });
}
main().catch(console.error);

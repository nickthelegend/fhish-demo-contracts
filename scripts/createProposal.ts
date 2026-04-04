import { ethers } from "hardhat";
import * as fs from "fs";

async function main() {
  const depl = JSON.parse(fs.readFileSync("deployments.json", "utf8"));
  const voting = await ethers.getContractAt("PrivateVoting", depl.PrivateVoting);
  console.log("Creating proposal 1...");
  const tx = await voting.createProposal(1);
  await tx.wait();
  console.log("Proposal 1 created, tx:", tx.hash);
}
main().catch(console.error);

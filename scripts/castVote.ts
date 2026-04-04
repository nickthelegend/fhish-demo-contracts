import { ethers } from "hardhat";
import * as fs from "fs";
import FhishClient from "@fhish/sdk";

async function main() {
  const depl = JSON.parse(fs.readFileSync("deployments.json", "utf8"));
  const voting = await ethers.getContractAt("PrivateVoting", depl.PrivateVoting);
  
  const client = new FhishClient({
    rpcUrl: "https://rpc.sepolia.org",
    chainId: 11155111,
    gatewayAddress: depl.FhishGateway
  });

  const encryptedVote = await client.encrypt(1); // 1 = YES
  
  console.log("Casting YES vote on proposal 1...");
  const tx = await voting.castVote(1, encryptedVote.ciphertext, true);
  await tx.wait();
  
  console.log("Vote cast! tx:", tx.hash);
}
main().catch(console.error);

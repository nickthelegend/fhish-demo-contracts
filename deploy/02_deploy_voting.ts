import { ethers } from "hardhat";
import * as fs from "fs";

async function main() {
  const depl = JSON.parse(fs.readFileSync("deployments.json", "utf8"));
  
  const PrivateVoting = await ethers.getContractFactory("PrivateVoting");
  const voting = await PrivateVoting.deploy(depl.FhishGateway);
  await voting.waitForDeployment();
  const address = await voting.getAddress();
  
  console.log("PrivateVoting deployed at:", address);
  
  depl.PrivateVoting = address;
  fs.writeFileSync("deployments.json", JSON.stringify(depl, null, 2));
}

main().catch(console.error);

import { ethers } from "hardhat";
import * as fs from "fs";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying gateway with:", deployer.address);
  
  // We need to fetch it from the hardhat environment which has it via fhish-contracts
  const FhishGateway = await ethers.getContractFactory("FhishGateway");
  const gateway = await FhishGateway.deploy();
  await gateway.waitForDeployment();
  const address = await gateway.getAddress();
  
  console.log("FhishGateway deployed at:", address);
  
  const relayerWallet = new ethers.Wallet("0xb7ed70b65b355f590f3851522616cc0df166ba3a9ee54b5a0ca08f96d38ee2cf");
  console.log("Setting relayer to:", relayerWallet.address);
  const tx = await gateway.setRelayer(relayerWallet.address);
  await tx.wait();
  
  const depl = { network: "sepolia", chainId: 11155111, FhishGateway: address, PrivateVoting: "" };
  fs.writeFileSync("deployments.json", JSON.stringify(depl, null, 2));
}

main().catch(console.error);

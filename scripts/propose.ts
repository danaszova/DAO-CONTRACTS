import { ethers, network } from "hardhat";
import * as fs from "fs";
import {
  NEW_STORE_VALUE,
  FUNC,
  PROPOSAL_DESCRIPTON,
  VOTING_DELAY,
  developmentChains,
  proposalsFile,
} from "../helper-hardhat-config";

import { moveBlocks } from "../utils/move-blocks";

export async function propose(
  args: any[],
  functionToCall: string,
  proposalDescription: string
) {
  const governor = await ethers.getContract("GovernorContract");

  const box = await ethers.getContract("Box");

  //Encoding to bytes to meet requirements for expected input for deployed propose contract
  const encodedFunctionCall = box.interface.encodeFunctionData(
    functionToCall,
    args
  );
  //console.log(encodedFunctionCall);
  console.log(`Proposing ${functionToCall} on ${box.address} with ${args}`);
  console.log(`Proposal Description: \n ${proposalDescription}`);

  const proposeTx = await governor.propose(
    [box.address],
    [0],
    [encodedFunctionCall],
    proposalDescription
  );
  const proposeReciept = await proposeTx.wait();

  // On a local chain we do not have to wait for the blocks to be created
  if (developmentChains.includes(network.name)) {
    await moveBlocks(VOTING_DELAY + 1);
  }

  //Voting delay has passed - we need the propsal id so we can vote
  const proposalId = proposeReciept.events[0].args.proposalId;
  let proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"));
  proposals[network.config.chainId!.toString()].push(proposalId.toString());
  fs.writeFileSync(proposalsFile, JSON.stringify(proposals));
}

propose([NEW_STORE_VALUE], FUNC, PROPOSAL_DESCRIPTON)
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });

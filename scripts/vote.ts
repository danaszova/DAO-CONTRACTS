import * as fs from "fs";
import { ethers, network } from "hardhat";
import {
  proposalsFile,
  developmentChains,
  VOTING_DELAY,
} from "../helper-hardhat-config";
import { moveBlocks } from "../utils/move-blocks";

const index = 0;

async function main(proposalIndex: number) {
  const proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"));
  const propsalId = proposals[network.config.chainId!][proposalIndex];
  const reason = "I like a Doo De Cha Cha";

  //0=Against, 1=For, 2=Abstain

  const voteWay = 1;

  const governor = await ethers.getContract("GovernorContract");
  const voteTxResponse = await governor.castVoteWithReason(
    propsalId,
    voteWay,
    reason
  );

  await voteTxResponse.wait(1);

  // On a local chain we do not have to wait for the blocks to be created
  if (developmentChains.includes(network.name)) {
    await moveBlocks(VOTING_DELAY + 1);
  }

  console.log("Voted, Ready to go!");
}

main(index)
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });

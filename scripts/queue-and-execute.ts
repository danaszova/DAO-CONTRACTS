import * as fs from "fs";
import { ethers, network } from "hardhat";
import {
  NEW_STORE_VALUE,
  FUNC,
  PROPOSAL_DESCRIPTON,
  VOTING_DELAY,
  developmentChains,
  MIN_DELAY,
} from "../helper-hardhat-config";
import { moveTime } from "../utils/move-time";
import { moveBlocks } from "../utils/move-blocks";

export async function queueAndExecute() {
  const args = [NEW_STORE_VALUE];

  const box = await ethers.getContract("Box");

  //Encoding to bytes to meet requirements for expected input for deployed propose contract
  const encodedFunctionCall = box.interface.encodeFunctionData(FUNC, args);

  // description sent with proposed was auto hashed on chain
  const descriptionHash = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(PROPOSAL_DESCRIPTON)
  );

  const governor = await ethers.getContract("GovernorContract");

  console.log("Queuing...");

  const queueTx = await governor.queue(
    [box.address],
    [0],
    [encodedFunctionCall],
    descriptionHash
  );

  await queueTx.wait(1);

  // On a local chain we do not have to wait for the blocks to be created
  if (developmentChains.includes(network.name)) {
    await moveTime(MIN_DELAY + 1);
    await moveBlocks(1);
  }

  console.log("Executing...");

  const executeTx = await governor.execute(
    [box.address],
    [0],
    [encodedFunctionCall],
    descriptionHash
  );
  //Wait 1 blocks
  await executeTx.wait(1);

  const boxNewValue = await box.retrieve();

  console.log(`New box value: ${boxNewValue.toString()} `);
}

queueAndExecute()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });

//Utilty to move blocks forward in a local chain

import { network } from "hardhat";
export async function moveBlocks(amount: number) {
  console.log("moving blocks...");
  for (let index = 0; index < amount; index++) {
    await network.provider.request({
      method: "evm_mine",
      params: [],
    });
  }
}

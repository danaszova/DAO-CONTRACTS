//Utilty to move time forward in a local chain

import { network } from "hardhat";
export async function moveTime(amount: number) {
  console.log("moving time...");

  await network.provider.send("evm_increaseTime", [amount]);

  console.log(`Mover forward ${amount} in seconds`);
}

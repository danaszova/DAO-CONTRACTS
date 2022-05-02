import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import { ADDRESS_ZERO } from "../helper-hardhat-config";

const setUpContracts: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();

  const timeLock = await ethers.getContract("TimeLock", deployer);
  const governor = await ethers.getContract("GovernorContract", deployer);

  log("Setting up roles...");

  //only the governor should be able to send information to the timelock

  //the timelock is actually the one that executes everything

  const proposerRole = await timeLock.PROPOSER_ROLE();
  const executorRole = await timeLock.EXECUTOR_ROLE();
  const adminRole = await timeLock.TIMELOCK_ADMIN_ROLE();

  const proposerTx = await timeLock.grantRole(proposerRole, governor.address);
  await proposerTx.wait(1);

  const executorTx = await timeLock.grantRole(executorRole, ADDRESS_ZERO);
  //The executor role has purposely been given to nobody - which means everybody - ADDRESS_ZERO

  executorTx.wait(1);

  //we needed the deployer to own the TimeLock up until this point to set up the other roles

  //We are finished setting up so we revoke the timelock from the deployed so there is no centralized control of the timelock

  const revokeTx = await timeLock.revokeRole(adminRole, deployer);

  revokeTx.wait(1);

  //After this is executed - it is impossible for anyone to do anything with the timelock without going through governance
};

export default setUpContracts;
